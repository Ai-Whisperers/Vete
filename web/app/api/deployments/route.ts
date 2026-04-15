import { NextApiRequest, NextApiResponse } from 'next';
import { createDeploymentsClient } from '@/lib/supabase/deployments';
import { DeploymentService } from '@/lib/domain/deployments/service';

const deploymentsClient = createDeploymentsClient();
const deploymentService = new DeploymentService(deploymentsClient);

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const data = req.body;
    const deployment = await deploymentService.createDeployment(data);
    return res.status(201).json(deployment);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}