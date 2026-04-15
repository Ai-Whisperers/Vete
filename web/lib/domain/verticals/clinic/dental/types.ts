import { z } from 'zod';

export const ToothCondition = z.enum(['healthy', 'cavities', 'missing', 'loose', 'other']);
export const DentalProcedure = z.enum(['cleaning', 'extraction', 'filling', 'crown', 'other']);
export const ToothDiagram = z.record(z.string(), z.string());

export type ToothConditionType = z.infer<typeof ToothCondition>;
export type DentalProcedureType = z.infer<typeof DentalProcedure>;
export type ToothDiagramType = z.infer<typeof ToothDiagram>;

export interface DentalChart {
  id: string;
  pet_id: string;
  tenant_id: string;
  created_at: Date;
  updated_at: Date;
  tooth_diagram: ToothDiagramType;
  conditions: { [tooth: string]: ToothConditionType };
  procedures: { [tooth: string]: DentalProcedureType[] };
}

export interface CreateDentalChartData {
  pet_id: string;
  tooth_diagram: ToothDiagramType;
  conditions: { [tooth: string]: ToothConditionType };
  procedures: { [tooth: string]: DentalProcedureType[] };
}

export interface UpdateDentalChartData {
  tooth_diagram?: ToothDiagramType;
  conditions?: { [tooth: string]: ToothConditionType };
  procedures?: { [tooth: string]: DentalProcedureType[] };
}