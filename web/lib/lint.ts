import { lint } from 'eslint'
import { resolve } from 'path'

const rootDir = resolve(__dirname, '..')

export const lintCode = async () => {
  const [errors, warnings] = await lint.lintFiles(['**/*.{ts,tsx}'], {
    overrideConfigFile: resolve(rootDir, '.eslintrc.json'),
  })

  if (errors.length > 0 || warnings.length > 0) {
    throw new Error('Lint errors found')
  }
}