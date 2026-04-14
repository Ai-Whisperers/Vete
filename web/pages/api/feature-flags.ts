import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

const handleGetFeatureFlags = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tenantId } = req.query;
  const { data, error } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('tenant_id', tenantId);
  if (error) {
    return res.status(500).json({ error: 'Failed to fetch feature flags' });
  }
  return res.json(data);
};

const handleUpdateFeatureFlag = async (req: NextApiRequest, res: NextApiResponse) => {
  const { featureFlagId, enabled } = req.body;
  const { data, error } = await supabase
    .from('feature_flags')
    .update({
      id: featureFlagId,
      enabled,
    });
  if (error) {
    return res.status(500).json({ error: 'Failed to update feature flag' });
  }
  return res.json(data);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGetFeatureFlags(req, res);
    case 'PATCH':
      return handleUpdateFeatureFlag(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}