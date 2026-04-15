import { useServer } from 'next/server'
import { AnesthesiaService } from '@/lib/domain/verticals/clinic/anesthesia/service'
import { AnesthesiaRecord, CreateAnesthesiaRecordData } from '@/lib/domain/verticals/clinic/anesthesia/types'

export async function POST({ request, tenantId }: { request: Request; tenantId: string }) {
  const service = new AnesthesiaService()
  const data: CreateAnesthesiaRecordData = await request.json()

  try {
    const record = await service.createAnesthesiaRecord(data, tenantId)
    return new Response(JSON.stringify(record), { status: 201 })
  } catch (error) {
    return new Response(error.message, { status: 500 })
  }
}

export async function GET({ params, tenantId }: { params: { id: string }; tenantId: string }) {
  const service = new AnesthesiaService()
  const id = params.id

  try {
    const record = await service.getAnesthesiaRecord(id, tenantId)
    if (!record) {
      return new Response('Not Found', { status: 404 })
    }
    return new Response(JSON.stringify(record), { status: 200 })
  } catch (error) {
    return new Response(error.message, { status: 500 })
  }
}

export async function PATCH({ params, request, tenantId }: { params: { id: string }; request: Request; tenantId: string }) {
  const service = new AnesthesiaService()
  const id = params.id
  const updates: Partial<AnesthesiaRecord> = await request.json()

  try {
    const record = await service.updateAnesthesiaRecord(id, updates, tenantId)
    return new Response(JSON.stringify(record), { status: 200 })
  } catch (error) {
    return new Response(error.message, { status: 500 })
  }
}

### Database Schema
This will require the following tables in your Supabase database:
CREATE TABLE anesthesia_records (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  procedure_id UUID NOT NULL,
  anesthesia_type VARCHAR(50) NOT NULL,
  induction_time TIMESTAMP NOT NULL,
  maintenance_time TIMESTAMP,
  recovery_time TIMESTAMP,
  vital_signs JSONB NOT NULL,
  notes TEXT,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vital_signs (
  id UUID PRIMARY KEY,
  anesthesia_record_id UUID NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  temperature DECIMAL(5, 2) NOT NULL,
  heart_rate INTEGER NOT NULL,
  respiratory_rate INTEGER NOT NULL,
  blood_pressure VARCHAR(20) NOT NULL,
  oxygen_saturation DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (anesthesia_record_id) REFERENCES anesthesia_records(id)
);