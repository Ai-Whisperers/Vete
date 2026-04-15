import { NextApiRequest, NextApiResponse } from 'next';
import { createDeploymentsClient } from '@/lib/supabase/deployments';
import { DeploymentService } from '@/lib/domain/deployments/service';

const deploymentsClient = createDeploymentsClient();
const deploymentService = new DeploymentService(deploymentsClient);

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id;

  if (req.method === 'PATCH') {
    const data = req.body;
    const deployment = await deploymentService.updateDeployment(id as string, data);
    return res.status(200).json(deployment);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}