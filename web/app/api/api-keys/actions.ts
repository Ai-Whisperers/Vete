import { useServer } from 'next/server'
import { ApiKeyService } from '../../../lib/domain/api-keys/service'
import { createClient } from '../../../lib/supabase/server'

export async function GET({ tenantId }: { tenantId: string }) {
  const supabase = createClient()
  const apiKeyService = new ApiKeyService(supabase)

  const apiKeys = await apiKeyService.getApiKeys(tenantId)

  return new Response(JSON.stringify(apiKeys), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST({ request, tenantId }: { request: Request; tenantId: string }) {
  const supabase = createClient()
  const apiKeyService = new ApiKeyService(supabase)

  const data = await request.json()
  const apiKey = await apiKeyService.createApiKey(data, tenantId)

  return new Response(JSON.stringify(apiKey), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 201,
  })
}

export async function PATCH({ params, request, tenantId }: { params: { id: string }; request: Request; tenantId: string }) {
  const supabase = createClient()
  const apiKeyService = new ApiKeyService(supabase)

  const data = await request.json()
  const apiKey = await apiKeyService.updateApiKey(params.id, data, tenantId)

  return new Response(JSON.stringify(apiKey), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function DELETE({ params, tenantId }: { params: { id: string }; tenantId: string }) {
  const supabase = createClient()
  const apiKeyService = new ApiKeyService(supabase)

  await apiKeyService.deleteApiKey(params.id, tenantId)

  return new Response(null, {
    status: 204,
  })
}

### Database Schema

CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  scopes JSONB NOT NULL,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_tenant_id ON api_keys (tenant_id);