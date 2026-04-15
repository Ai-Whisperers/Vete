import { DiagnosisCodeRepository } from './repository';
import { DiagnosisCode } from './types';

export class DiagnosisCodeService {
  private repository: DiagnosisCodeRepository;

  constructor() {
    this.repository = new DiagnosisCodeRepository();
  }

  async getAllDiagnosisCodes(): Promise<DiagnosisCode[]> {
    return this.repository.findAll();
  }

  async getDiagnosisCodeByCode(code: string): Promise<DiagnosisCode | null> {
    return this.repository.findByCode(code);
  }
}

#### Server Actions

Next, we will create the server actions for the diagnosis codes lookup feature.