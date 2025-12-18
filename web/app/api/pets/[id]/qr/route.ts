import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: petId } = await params;
        const supabase = await createClient();

        // 1. Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Verify pet ownership or vet/admin access
        const { data: pet, error: petError } = await supabase
            .from('pets')
            .select('id, name, owner_id, tenant_id, species, breed, microchip_id')
            .eq('id', petId)
            .single();

        if (petError || !pet) {
            return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
        }

        // Check if user is owner or staff
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, tenant_id')
            .eq('id', user.id)
            .single();

        const isOwner = pet.owner_id === user.id;
        const isStaff = profile && ['vet', 'admin'].includes(profile.role) && profile.tenant_id === pet.tenant_id;

        if (!isOwner && !isStaff) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 3. Fetch owner contact info
        const { data: owner } = await supabase
            .from('profiles')
            .select('full_name, phone, email')
            .eq('id', pet.owner_id)
            .single();

        // 4. Generate QR data payload
        const qrData = {
            petId: pet.id,
            petName: pet.name,
            species: pet.species,
            breed: pet.breed,
            microchip: pet.microchip_id,
            ownerName: owner?.full_name,
            ownerPhone: owner?.phone,
            ownerEmail: owner?.email,
            scanUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/scan/${pet.id}`
        };

        // 5. Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 512,
            margin: 2
        });

        // 6. Convert data URL to buffer for upload
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // 7. Upload to Supabase Storage
        const fileName = `${petId}-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('pet-qr-codes')
            .upload(fileName, buffer, {
                contentType: 'image/png',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload QR code' }, { status: 500 });
        }

        // 8. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('pet-qr-codes')
            .getPublicUrl(uploadData.path);

        // 9. Deactivate old QR codes for this pet
        await supabase
            .from('pet_qr_codes')
            .update({ is_active: false })
            .eq('pet_id', petId)
            .eq('is_active', true);

        // 10. Save QR code record
        const { data: qrRecord, error: insertError } = await supabase
            .from('pet_qr_codes')
            .insert({
                pet_id: petId,
                qr_code_url: publicUrl,
                qr_data: JSON.stringify(qrData),
                is_active: true
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json({ error: 'Failed to save QR code record' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            qrCode: {
                id: qrRecord.id,
                url: publicUrl,
                scanUrl: qrData.scanUrl
            }
        });

    } catch (e: any) {
        console.error('QR generation error:', e);
        return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
    }
}

// GET: Retrieve active QR code for a pet
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: petId } = await params;
        const supabase = await createClient();

        const { data: qrCode, error } = await supabase
            .from('pet_qr_codes')
            .select('*')
            .eq('pet_id', petId)
            .eq('is_active', true)
            .single();

        if (error || !qrCode) {
            return NextResponse.json({ qrCode: null });
        }

        return NextResponse.json({ qrCode });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
