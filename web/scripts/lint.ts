import { lintCode } from '../lib/lint'

lintCode().catch((error) => {
  console.error(error)
  process.exit(1)
})