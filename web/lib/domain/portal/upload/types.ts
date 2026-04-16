import { z } from 'zod';

export const UploadType = z.enum(['prescription', 'vaccination-record', 'medical-record']);
export type UploadType = z.infer<typeof UploadType>;

export const UploadDocument = z.object({
  id: z.string(),
  type: UploadType,
  petId: z.string(),
  ownerId: z.string(),
  tenantId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  uploadedAt: z.date(),
});
export type UploadDocument = z.infer<typeof UploadDocument>;

export const CreateUploadDocumentInput = z.object({
  type: UploadType,
  petId: z.string(),
  ownerId: z.string(),
  tenantId: z.string(),
  file: z.instanceof(File),
});
export type CreateUploadDocumentInput = z.infer<typeof CreateUploadDocumentInput>;