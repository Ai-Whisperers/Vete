import { WebrtcCallService } from '@/lib/domain/core/webrtc/service'
import { createServerClient } from '@/lib/supabase/server'

export async function POST({ request }: { request: Request }) {
  const supabase = await createServerClient()
  const webrtcCallService = new WebrtcCallService(supabase)

  const data = await request.json()
  const userId = data.userId
  const tenantId = data.tenantId

  const webrtcCall = await webrtcCallService.createWebrtcCall(data, userId, tenantId)

  return new Response(JSON.stringify(webrtcCall), { status: 201 })
}

export async function PATCH({ request, params }: { request: Request; params: { id: string } }) {
  const supabase = await createServerClient()
  const webrtcCallService = new WebrtcCallService(supabase)

  const data = await request.json()
  const userId = data.userId
  const tenantId = data.tenantId

  const webrtcCall = await webrtcCallService.updateWebrtcCall(params.id, data, userId, tenantId)

  return new Response(JSON.stringify(webrtcCall), { status: 200 })
}

### Database Schema

CREATE TABLE webrtc_calls (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  caller_id UUID NOT NULL,
  caller_type VARCHAR(10) NOT NULL,
  callee_id UUID NOT NULL,
  callee_type VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL,
  type VARCHAR(10) NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webrtc_calls_tenant_id ON webrtc_calls (tenant_id);
CREATE INDEX idx_webrtc_calls_caller_id ON webrtc_calls (caller_id);
CREATE INDEX idx_webrtc_calls_callee_id ON webrtc_calls (callee_id);