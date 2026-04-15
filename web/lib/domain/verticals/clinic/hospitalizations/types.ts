export type DischargeStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type DischargeType = 'routine' | 'emergency' | 'transfer'

interface DischargeChecklist {
  id: string
  hospitalization_id: string
  item: string
  is_completed: boolean
  created_at: Date
  updated_at: Date
}

interface DischargeMedication {
  id: string
  hospitalization_id: string
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  created_at: Date
  updated_at: Date
}

interface FollowUpAppointment {
  id: string
  hospitalization_id: string
  start_time: Date
  end_time: Date
  created_at: Date
  updated_at: Date
}

interface DischargeInstructions {
  id: string
  hospitalization_id: string
  instructions: string
  created_at: Date
  updated_at: Date
}

interface DischargePlan {
  id: string
  hospitalization_id: string
  discharge_status: DischargeStatus
  discharge_type: DischargeType
  discharge_checklist: DischargeChecklist[]
  discharge_medication: DischargeMedication[]
  follow_up_appointment: FollowUpAppointment | null
  discharge_instructions: DischargeInstructions | null
  created_at: Date
  updated_at: Date
}

export interface CreateDischargePlanData {
  hospitalization_id: string
  discharge_status: DischargeStatus
  discharge_type: DischargeType
  discharge_checklist: DischargeChecklist[]
  discharge_medication: DischargeMedication[]
  follow_up_appointment: FollowUpAppointment | null
  discharge_instructions: DischargeInstructions | null
}

export interface UpdateDischargePlanData {
  id: string
  discharge_status?: DischargeStatus
  discharge_type?: DischargeType
  discharge_checklist?: DischargeChecklist[]
  discharge_medication?: DischargeMedication[]
  follow_up_appointment?: FollowUpAppointment | null
  discharge_instructions?: DischargeInstructions | null
}