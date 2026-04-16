import { UploadRepository } from './repository';
import { CreateUploadDocumentInput } from './types';

export class UploadService {
  private repository: UploadRepository;

  constructor() {
    this.repository = new UploadRepository();
  }

  async uploadDocument(input: CreateUploadDocumentInput): Promise<UploadDocument> {
    return this.repository.createDocument(input);
  }

  async getDocumentsByPetId(petId: string, tenantId: string): Promise<UploadDocument[]> {
    return this.repository.getDocumentsByPetId(petId, tenantId);
  }
}