import { describe, it, expect } from 'vitest'
import { performance } from 'perf_hooks'
import { createClient } from '@/lib/supabase/client'

describe('Performance Regression Tests', () => {
  const supabase = createClient()

  it('should detect performance regression', async () => {
    const startTime = performance.now()
    await supabase.from('pets').select('*').eq('tenant_id', 'tenant-1')
    const endTime = performance.now()
    const responseTime = endTime - startTime

    expect(responseTime).toBeLessThan(2000)
  })
})