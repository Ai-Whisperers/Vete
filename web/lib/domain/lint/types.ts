export interface LintError {
  file: string
  line: number
  column: number
  message: string
}

export interface LintWarning {
  file: string
  line: number
  column: number
  message: string
}