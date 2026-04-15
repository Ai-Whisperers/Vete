import { DentalChartRepository } from './repository';
import { DentalChart, CreateDentalChartData, UpdateDentalChartData } from './types';

export class DentalChartService {
  private repository: DentalChartRepository;

  constructor() {
    this.repository = new DentalChartRepository();
  }

  async createDentalChart(data: CreateDentalChartData, userId: string, tenantId: string): Promise<DentalChart> {
    return this.repository.create(data, userId, tenantId);
  }

  async updateDentalChart(id: string, data: UpdateDentalChartData, userId: string, tenantId: string): Promise<DentalChart> {
    return this.repository.update(id, data, userId, tenantId);
  }

  async getDentalChart(id: string, tenantId: string): Promise<DentalChart | null> {
    return this.repository.findById(id, tenantId);
  }
}