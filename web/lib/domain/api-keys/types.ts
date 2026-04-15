import { z } from 'zod'

export const ApiKeyScope = z.enum(['read', 'write', 'delete'])

export const CreateApiKeyData = z.object({
  name: z.string(),
  scopes: z.array(ApiKeyScope),
})

export const UpdateApiKeyData = z.object({
  id: z.string(),
  name: z.string().optional(),
  scopes: z.array(ApiKeyScope).optional(),
})

export interface ApiKey {
  id: string
  name: string
  scopes: ApiKeyScope[]
  tenant_id: string
  created_at: Date
  updated_at: Date
}

#### Repository