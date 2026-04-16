import { useServer } from 'next/server';
import { UploadService } from '@/lib/domain/portal/upload/service';
import { CreateUploadDocumentInput } from '@/lib/domain/portal/upload/types';

export async function POST({ request }: { request: Request }) {
  const service = new UploadService();
  const input: CreateUploadDocumentInput = await request.json();

  try {
    const document = await service.uploadDocument(input);
    return new Response(JSON.stringify(document), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to upload document' }), { status: 500 });
  }
}