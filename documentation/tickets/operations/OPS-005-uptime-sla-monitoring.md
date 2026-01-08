# OPS-005: Uptime SLA Monitoring

## Priority: P2
## Category: Operations
## Status: Not Started
## Epic: [EPIC-11: Operations & Observability](../epics/EPIC-11-operations.md)

## Description
Implement uptime monitoring with SLA tracking to ensure service availability meets commitments.

## Current State
- No formal uptime monitoring
- No SLA tracking
- Outages discovered by users
- No status page for customers

## Proposed Solution
Set up external uptime monitoring with status page and SLA calculations.

### Health Check Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkSupabaseAuth(),
  ]);

  const allHealthy = checks.every(c => c.healthy);

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: checks,
    version: process.env.APP_VERSION,
  }, {
    status: allHealthy ? 200 : 503,
  });
}

async function checkDatabase() {
  try {
    const start = Date.now();
    await supabase.from('tenants').select('id').limit(1);
    return { name: 'database', healthy: true, latency: Date.now() - start };
  } catch {
    return { name: 'database', healthy: false, latency: 0 };
  }
}
```

### SLA Calculation
```typescript
// lib/monitoring/sla.ts
interface SLAMetrics {
  period: 'daily' | 'weekly' | 'monthly';
  totalMinutes: number;
  downtimeMinutes: number;
  uptimePercentage: number;
  slaTarget: number;
  slaStatus: 'met' | 'breached';
}

export function calculateSLA(incidents: Incident[], period: string): SLAMetrics {
  const totalMinutes = getPeriodMinutes(period);
  const downtimeMinutes = incidents.reduce((sum, i) => sum + i.durationMinutes, 0);
  const uptimePercentage = ((totalMinutes - downtimeMinutes) / totalMinutes) * 100;

  return {
    period,
    totalMinutes,
    downtimeMinutes,
    uptimePercentage,
    slaTarget: 99.9,
    slaStatus: uptimePercentage >= 99.9 ? 'met' : 'breached',
  };
}
```

### Status Page Integration
- Use Betterstack, Instatus, or Statuspage.io
- Automatic incident creation on downtime
- Subscriber notifications

## Implementation Steps
1. Create comprehensive health check endpoint
2. Set up external monitoring (Betterstack recommended)
3. Configure health checks every 1 minute
4. Create public status page
5. Implement SLA calculation dashboard
6. Set up incident management workflow
7. Configure subscriber notifications

## Acceptance Criteria
- [ ] Health endpoint checks all services
- [ ] External monitoring every 1 minute
- [ ] Public status page available
- [ ] SLA calculated and displayed
- [ ] Automatic incident creation
- [ ] 99.9% uptime target tracked

## Related Files
- `app/api/health/` - Health endpoints
- `lib/monitoring/` - Monitoring infrastructure

## Estimated Effort
- 5 hours
  - Health endpoint: 1h
  - External monitoring setup: 2h
  - Status page: 1h
  - SLA dashboard: 1h
