export type RetentionAction = 'delete' | 'archive' | 'soft_delete'

export interface RetentionPolicy {
  table: string
  description: string
  retentionPeriod: string
  action: RetentionAction
  dateColumn: string
  condition?: string
  enabled: boolean
  legalNote?: string
  priority: number
}

export const retentionPolicies: RetentionPolicy[] = [
  {
    table: 'appointments',
    description: 'Appointment records',
    retentionPeriod: '1 year',
    action: 'archive',
    dateColumn: 'created_at',
    enabled: true,
    priority: 10,
  },
  {
    table: 'medical_records',
    description: 'Medical records',
    retentionPeriod: '10 years',
    action: 'archive',
    dateColumn: 'created_at',
    enabled: true,
    priority: 20,
  },
  // Add more policies as needed
]

export function getActiveRetentionPolicies(): RetentionPolicy[] {
  return retentionPolicies.filter((policy) => policy.enabled)
}

#### 2. Data Retention Job

This file will contain the logic for running the data retention job.