interface Patient {
  id: number;
  name: string;
}

interface DischargePlan {
  id: number;
  patient_id: number;
  medications: string;
  follow_up_date: Date;
  instructions: string;
}

export { Patient, DischargePlan };