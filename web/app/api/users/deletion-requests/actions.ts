import type { NextRequest } from 'next/server'
import { withApiAuth } from '@/lib/auth'
import { UserService } from '@/lib/domain/core/users/service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const service = new UserService(supabase)

  const userId = request.nextUrl.searchParams.get('userId')
  const tenantId = request.nextUrl.searchParams.get('tenantId')

  if (!userId || !tenantId) {
    return new Response('Invalid request', { status: 400 })
  }

  const data: DeleteUserData = {
    userId,
    tenantId,
  }

  try {
    const deletionRequest = await service.requestDeletion(data)
    return new Response(JSON.stringify(deletionRequest), { status: 201 })
  } catch (error) {
    return new Response('Failed to create deletion request', { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const service = new UserService(supabase)

  const id = request.nextUrl.searchParams.get('id')
  const tenantId = request.nextUrl.searchParams.get('tenantId')

  if (!id || !tenantId) {
    return new Response('Invalid request', { status: 400 })
  }

  try {
    const deletionRequest = await service.confirmDeletion(id, tenantId)
    return new Response(JSON.stringify(deletionRequest), { status: 200 })
  } catch (error) {
    return new Response('Failed to confirm deletion', { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  const service = new UserService(supabase)

  const id = request.nextUrl.searchParams.get('id')
  const tenantId = request.nextUrl.searchParams.get('tenantId')

  if (!id || !tenantId) {
    return new Response('Invalid request', { status: 400 })
  }

  try {
    await service.cancelDeletion(id, tenantId)
    return new Response('Deletion cancelled', { status: 200 })
  } catch (error) {
    return new Response('Failed to cancel deletion', { status: 500 })
  }
}

### Database Schema

The following tables and columns are required for the deletion workflow:

* `deletion_requests` table:
	+ `id` (primary key)
	+ `user_id` (foreign key referencing the `users` table)
	+ `tenant_id` (foreign key referencing the `tenants` table)
	+ `requested_at` (timestamp)
	+ `confirmed_at` (timestamp, nullable)
	+ `grace_period_expires_at` (timestamp, nullable)

Note: The `deletion_requests` table is used to store the deletion requests, and the `users` table is used to store the user data. The `tenants` table is used to store the tenant data.

Please ensure that the database schema is updated to include the required tables and columns.