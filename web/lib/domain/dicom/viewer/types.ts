import { z } from 'zod';

export const DicomImage = z.object({
  id: z.string(),
  tenantId: z.string(),
  petId: z.string(),
  image: z.string(), // base64 encoded DICOM image
  createdAt: z.date(),
});

export type DicomImage = z.infer<typeof DicomImage>;

export const DicomViewerConfig = z.object({
  zoom: z.number(),
  pan: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export type DicomViewerConfig = z.infer<typeof DicomViewerConfig>;