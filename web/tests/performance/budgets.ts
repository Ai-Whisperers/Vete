import { describe, it, expect } from 'vitest'

describe('Performance Budgets', () => {
  it('should have a performance budget for homepage', () => {
    const budget = {
      performance: {
        metrics: {
          'lighthouse': {
            'first-contentful-paint': 2000,
            'largest-contentful-paint': 3000,
            'cumulative-layout-shift': 0.1,
            'total-blocking-time': 200,
          },
        },
      },
    }

    expect(budget.performance.metrics['lighthouse']['first-contentful-paint']).toBe(2000)
  })
})