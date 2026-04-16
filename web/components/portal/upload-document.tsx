import { useState } from 'react';
import { UploadDocument } from '@/lib/domain/portal/upload/types';
import { UploadService } from '@/lib/domain/portal/upload/service';

export function UploadDocumentComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const service = new UploadService();
      const input: CreateUploadDocumentInput = {
        type: 'prescription',
        petId: 'pet-id',
        ownerId: 'owner-id',
        tenantId: 'tenant-id',
        file,
      };
      const document = await service.uploadDocument(input);
      console.log(document);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  );
}