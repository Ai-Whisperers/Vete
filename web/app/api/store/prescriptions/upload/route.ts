import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/**
 * POST /api/store/prescriptions/upload
 * Upload a prescription file to Supabase Storage
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  // Get user's profile for tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { message: 'Perfil no encontrado' }
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const clinic = formData.get('clinic') as string | null;
    const productId = formData.get('productId') as string | null;

    if (!file) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'No se proporcionó archivo' }
      });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError('FILE_TOO_LARGE', HTTP_STATUS.BAD_REQUEST, {
        details: { message: `Archivo muy grande. Máximo ${MAX_FILE_SIZE / (1024 * 1024)}MB` }
      });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError('INVALID_FILE_TYPE', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Tipo de archivo no permitido. Use PDF, JPG o PNG' }
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'pdf';
    const safeName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars
      .substring(0, 50); // Limit length

    // Build path: prescriptions/{tenant_id}/{user_id}/{timestamp}_{filename}.{ext}
    const filePath = `prescriptions/${profile.tenant_id}/${user.id}/${timestamp}_${safeName}.${extension}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading prescription:', uploadError);
      return apiError('UPLOAD_FAILED', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: 'Error al subir archivo' }
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Optionally log the upload for audit
    await supabase
      .from('audit_logs')
      .insert({
        tenant_id: profile.tenant_id,
        user_id: user.id,
        action: 'prescription_uploaded',
        resource: 'store_order_items',
        details: {
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          product_id: productId,
        },
      });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
    }, { status: 201 });

  } catch (error) {
    console.error('Error in prescription upload:', error);
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
