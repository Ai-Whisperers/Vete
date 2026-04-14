import type { LintError, LintWarning } from './types'

export class LintRepository {
  async getErrors(): Promise<LintError[]> {
    // Implement logic to retrieve lint errors
  }

  async getWarnings(): Promise<LintWarning[]> {
    // Implement logic to retrieve lint warnings
  }
}