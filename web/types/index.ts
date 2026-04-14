interface TreatmentTemplate {
  id: number;
  name: string;
}

interface Task {
  id: number;
  name: string;
  pet_id: number;
  staff_id: number | null;
  completed: boolean;
}

interface Staff {
  id: number;
  name: string;
}

export { TreatmentTemplate, Task, Staff };