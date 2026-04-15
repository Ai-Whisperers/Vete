import { z } from 'zod';

export const DeploymentStatus = z.enum(['pending', 'success', 'failure']);
export type DeploymentStatus = z.infer<typeof DeploymentStatus>;

export const Deployment = z.object({
  id: z.string(),
  url: z.string(),
  status: DeploymentStatus,
  createdAt: z.date(),
});
export type Deployment = z.infer<typeof Deployment>;

export const CreateDeploymentData = z.object({
  url: z.string(),
  status: DeploymentStatus,
});
export type CreateDeploymentData = z.infer<typeof CreateDeploymentData>;

export const UpdateDeploymentData = z.object({
  status: DeploymentStatus,
});
export type UpdateDeploymentData = z.infer<typeof UpdateDeploymentData>;