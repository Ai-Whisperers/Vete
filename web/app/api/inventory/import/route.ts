import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    
    // 1. Auth & Role check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'vet')) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    try {
        let rpcData: any[] = [];
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const body = await req.json();
            rpcData = body.rows || [];
        } else {
            const formData = await req.formData();
            const type = formData.get('type') as string;
            
            if (type === 'image') {
                const file = formData.get('file') as File;
                const sku = formData.get('sku') as string;
                if (!file || !sku) return new NextResponse('Missing data', { status: 400 });

                const bytes = await file.arrayBuffer();
                const fileExt = file.name.split('.').pop();
                const fileName = `${profile.tenant_id}/${sku}_${Date.now()}.${fileExt}`;

                // Upload to Storage
                const { data: storageData, error: sError } = await supabase.storage
                    .from('store-products')
                    .upload(fileName, bytes, { contentType: file.type, upsert: true });

                if (sError) throw new Error(`Storage Error: ${sError.message}`);

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('store-products')
                    .getPublicUrl(fileName);

                // Update Product
                const { error: pError } = await supabase
                    .from('store_products')
                    .update({ image_url: publicUrl })
                    .eq('tenant_id', profile.tenant_id)
                    .eq('sku', sku);

                if (pError) throw new Error(`Product Update Error: ${pError.message}`);

                return NextResponse.json({ success: 1, url: publicUrl });
            }

            const file = formData.get('file') as File;
            if (!file) return new NextResponse('Missing file', { status: 400 });

            const bytes = await file.arrayBuffer();
            const workbook = XLSX.read(bytes, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet) as any[];

            // Map rows to RPC format
            rpcData = rows.map(row => ({
                operation: (row['Operation (Required)'] || row['Operation (Optional)'] || '').trim().toLowerCase(),
                sku: String(row['SKU'] || '').trim(),
                name: String(row['Name'] || '').trim(),
                category: String(row['Category'] || '').trim(),
                price: Number.parseFloat(row['Base Price (Sell)'] || '0'),
                quantity: Number.parseFloat(row['Quantity (Add/Remove)'] || '0'),
                cost: Number.parseFloat(row['Unit Cost (Buy)'] || '0'),
                description: row['Description'] || ''
            }));
        }

        // 3. Call Atomic RPC
        const { data: rpcResult, error: rpcError } = await supabase.rpc('import_inventory_batch', {
            p_tenant_id: profile.tenant_id,
            p_performer_id: user.id,
            p_rows: rpcData
        });

        if (rpcError) throw new Error(`RPC Error: ${rpcError.message}`);

        return NextResponse.json({
            success: rpcResult.success_count,
            errors: rpcResult.errors
        });

    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
