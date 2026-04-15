import { z } from 'zod';

export const GrowthChartType = z.enum(['weight', 'height']);

export type GrowthChartDataPoint = {
  age_weeks: number;
  value: number;
};

export type GrowthChart = {
  id: string;
  pet_id: string;
  type: GrowthChartType;
  data_points: GrowthChartDataPoint[];
};

export type CreateGrowthChartData = {
  pet_id: string;
  type: GrowthChartType;
  data_points: GrowthChartDataPoint[];
};

export type UpdateGrowthChartData = {
  data_points: GrowthChartDataPoint[];
};

export type GrowthChartFilters = {
  pet_id?: string;
  type?: GrowthChartType;
};