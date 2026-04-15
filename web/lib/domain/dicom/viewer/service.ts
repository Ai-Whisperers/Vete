import { DicomImage } from './types';
import { DicomViewerRepository } from './repository';

export class DicomViewerService {
  constructor(private repository: DicomViewerRepository) {}

  async uploadDicomImage(image: string, petId: string, tenantId: string): Promise<DicomImage> {
    return this.repository.uploadDicomImage(image, petId, tenantId);
  }

  async getDicomImage(id: string, tenantId: string): Promise<DicomImage | null> {
    return this.repository.getDicomImage(id, tenantId);
  }
}

#### Server Actions

We will create server actions for the DICOM viewer feature.