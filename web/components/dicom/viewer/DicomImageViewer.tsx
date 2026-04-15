import { useState, useEffect } from 'react';
import { DicomImage } from '@/lib/domain/dicom/viewer/types';

interface DicomImageViewerProps {
  id: string;
  tenantId: string;
}

const DicomImageViewer: React.FC<DicomImageViewerProps> = ({ id, tenantId }) => {
  const [dicomImage, setDicomImage] = useState<DicomImage | null>(null);

  useEffect(() => {
    const fetchDicomImage = async () => {
      const response = await fetch(`/api/dicom/images?id=${id}&tenantId=${tenantId}`);
      const data = await response.json();

      setDicomImage(data);
    };

    fetchDicomImage();
  }, [id, tenantId]);

  if (!dicomImage) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <img src={`data:image/dicom;base64,${dicomImage.image}`} alt="DICOM Image" />
    </div>
  );
};

export default DicomImageViewer;

#### Database Schema

We will add the necessary tables to the database schema.

CREATE TABLE dicom_images (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  image BYTEA NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (pet_id) REFERENCES pets (id)
);

This implementation provides the basic functionality for uploading and viewing DICOM images. It includes a domain layer for business logic, server actions for handling requests, and components for rendering the DICOM images. The database schema is also updated to include the necessary tables for storing DICOM images.