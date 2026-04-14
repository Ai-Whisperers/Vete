import { chromium } from 'playwright';
import { lighthouse } from 'lighthouse';
import { performance } from 'perf_hooks';

describe('Performance Regression Testing', () => {
  it('should not exceed performance budget', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://localhost:3000');

    const lighthouseOptions = {
      extends: 'lighthouse:default',
      settings: {
        budgets: [
          { path: '/', metric: 'total-blocking-time', budget: 300 },
          { path: '/', metric: 'cumulative-layout-shift', budget: 0.1 },
        ],
      },
    };

    const lighthouseResults = await lighthouse(page, lighthouseOptions);
    const performanceBudgets = lighthouseResults.audits['performance-budget'];

    expect(performanceBudgets.score).toBeGreaterThan(0.9);

    await browser.close();
  });
});