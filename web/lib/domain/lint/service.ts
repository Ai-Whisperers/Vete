import { LintRepository } from './repository'
import type { LintError, LintWarning } from './types'

export class LintService {
  private repository: LintRepository

  constructor() {
    this.repository = new LintRepository()
  }

  async getErrors(): Promise<LintError[]> {
    return this.repository.getErrors()
  }

  async getWarnings(): Promise<LintWarning[]> {
    return this.repository.getWarnings()
  }
}