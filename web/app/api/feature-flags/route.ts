import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function GET(request: Request) {
  const { supabase, featureFlagService } = await createClient();
  const tenantId = request.nextUrl.searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  const featureFlags = await featureFlagService.getFeatureFlags(tenantId);

  return NextResponse.json(featureFlags);
}

export async function PUT(request: Request) {
  const { supabase, featureFlagService } = await createClient();
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  const feature = request.nextUrl.searchParams.get('feature');
  const enabled = request.nextUrl.searchParams.get('enabled') === 'true';

  if (!tenantId || !feature) {
    return NextResponse.json({ error: 'Tenant ID and feature are required' }, { status: 400 });
  }

  await featureFlagService.updateFeatureFlag(tenantId, feature, enabled);

  return NextResponse.json({ message: 'Feature flag updated successfully' });
}

#### Feature Flag Dashboard

We will create a feature flag dashboard to display and update feature flags for each tenant.