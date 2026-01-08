# SCALE-001: Load Testing Framework

## Priority: P2
## Category: Scalability
## Status: Not Started
## Epic: [EPIC-14: Load Testing & Scalability](../epics/EPIC-14-load-testing-scalability.md)

## Description
Implement comprehensive load testing infrastructure to validate system performance under high traffic and identify bottlenecks.

## Current State
- No formal load testing framework
- Performance tested manually/ad-hoc
- Unknown system limits
- No baseline performance metrics

## Proposed Solution

### Load Testing Setup (k6)
```javascript
// tests/load/appointments.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up
    { duration: '5m', target: 50 },   // Sustain
    { duration: '2m', target: 100 },  // Peak load
    { duration: '5m', target: 100 },  // Sustain peak
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // <1% failure rate
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/appointments/available`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### CI Integration
```yaml
# .github/workflows/load-test.yml
name: Load Test
on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/load/appointments.js
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: k6-results
          path: results.json
```

### Results Dashboard
```typescript
// app/admin/performance/page.tsx
interface LoadTestResult {
  timestamp: Date;
  scenario: string;
  p50: number;
  p95: number;
  p99: number;
  throughput: number;
  errorRate: number;
}

export default function PerformanceDashboard() {
  const results = useLoadTestResults();

  return (
    <div>
      <h1>Performance Metrics</h1>

      <MetricCard label="P95 Response Time" value={`${results.p95}ms`} />
      <MetricCard label="Throughput" value={`${results.throughput} req/s`} />
      <MetricCard label="Error Rate" value={`${results.errorRate}%`} />

      <PerformanceTrendChart data={results.history} />
    </div>
  );
}
```

## Implementation Steps
1. Set up k6 load testing framework
2. Create test scenarios for critical paths
3. Define performance thresholds
4. Integrate with CI/CD pipeline
5. Create results dashboard
6. Establish baseline metrics
7. Document performance SLAs

## Acceptance Criteria
- [ ] k6 framework configured
- [ ] 10+ load test scenarios
- [ ] Automated weekly runs
- [ ] Results stored and visualized
- [ ] Performance baselines established
- [ ] Alert on threshold breaches

## Test Scenarios Required
- Appointment booking flow
- Service listing (public)
- Dashboard data loading
- Cart checkout process
- Search functionality
- File uploads (prescriptions)
- Concurrent user login

## Related Files
- `tests/load/` - Load test scripts
- `.github/workflows/` - CI configuration
- `app/admin/performance/` - Results dashboard

## Estimated Effort
- 10 hours
  - k6 setup: 2h
  - Test scenarios: 4h
  - CI integration: 2h
  - Dashboard: 2h
