import { z } from 'zod'

export const AnesthesiaStatus = z.enum(['induced', 'maintained', 'recovered'])
export const AnesthesiaType = z.enum(['general', 'local', 'sedation'])

export type VitalSign = {
  timestamp: Date
  temperature: number
  heartRate: number
  respiratoryRate: number
  bloodPressure: string
  oxygenSaturation: number
}

export type AnesthesiaRecord = {
  id: string
  patientId: string
  procedureId: string
  anesthesiaType: AnesthesiaType
  inductionTime: Date
  maintenanceTime: Date
  recoveryTime: Date
  vitalSigns: VitalSign[]
  notes: string
}

export type CreateAnesthesiaRecordData = Omit<AnesthesiaRecord, 'id'>

#### Repository