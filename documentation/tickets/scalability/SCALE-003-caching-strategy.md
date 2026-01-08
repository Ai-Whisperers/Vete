# SCALE-003: Application Caching Strategy

## Priority: P2
## Category: Scalability
## Status: Not Started
## Epic: [EPIC-14: Load Testing & Scalability](../epics/EPIC-14-load-testing-scalability.md)

## Description
Implement multi-layer caching strategy using Redis and Next.js caching to reduce database load and improve response times.

## Current State
- React Query provides client-side caching
- No server-side caching layer
- Static content regenerated on each request
- High database load for repeated queries

## Proposed Solution

### Redis Cache Layer
```typescript
// lib/cache/redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fn();
  await redis.setex(key, ttlSeconds, data);
  return data;
}

export async function invalidate(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### Cache Invalidation Patterns
```typescript
// lib/cache/invalidation.ts

// Invalidate on write
export async function createAppointment(data: AppointmentInput) {
  const appointment = await db.insert(appointmentsTable).values(data);

  // Invalidate related caches
  await invalidate(`appointments:${data.tenantId}:*`);
  await invalidate(`slots:${data.tenantId}:${data.date}`);

  return appointment;
}

// Cache keys by entity
export const CacheKeys = {
  services: (tenantId: string) => `services:${tenantId}`,
  slots: (tenantId: string, date: string) => `slots:${tenantId}:${date}`,
  pet: (petId: string) => `pet:${petId}`,
  products: (tenantId: string, category?: string) =>
    category ? `products:${tenantId}:${category}` : `products:${tenantId}:all`,
};
```

### Next.js Route Caching
```typescript
// app/api/services/route.ts
import { unstable_cache } from 'next/cache';

const getCachedServices = unstable_cache(
  async (tenantId: string) => {
    return await db.select().from(servicesTable)
      .where(eq(servicesTable.tenantId, tenantId));
  },
  ['services'],
  { revalidate: 300, tags: ['services'] }
);

export async function GET(request: NextRequest) {
  const tenantId = getTenantId(request);
  const services = await getCachedServices(tenantId);
  return NextResponse.json(services);
}

// Revalidate on update
export async function POST(request: NextRequest) {
  // ... create service
  revalidateTag('services');
  return NextResponse.json(service);
}
```

### Cache Warming
```typescript
// lib/cache/warmup.ts
export async function warmCache(tenantId: string) {
  await Promise.all([
    // Warm frequently accessed data
    cached(CacheKeys.services(tenantId), () => getServices(tenantId), 3600),
    cached(CacheKeys.products(tenantId), () => getProducts(tenantId), 1800),
    cached(`staff:${tenantId}`, () => getStaff(tenantId), 3600),
  ]);
}

// Warm on deploy or schedule
// api/cron/cache-warmup
export async function GET() {
  const tenants = await getActiveTenants();
  await Promise.all(tenants.map(t => warmCache(t.id)));
  return NextResponse.json({ warmed: tenants.length });
}
```

## Implementation Steps
1. Set up Upstash Redis connection
2. Create caching utility functions
3. Implement cache invalidation hooks
4. Add caching to high-traffic endpoints
5. Implement Next.js route caching
6. Create cache warming cron job
7. Add cache hit/miss monitoring

## Acceptance Criteria
- [ ] Redis cache layer implemented
- [ ] 10+ endpoints cached
- [ ] Cache invalidation working
- [ ] Cache hit rate > 80%
- [ ] Response times improved 50%+
- [ ] Cache monitoring dashboard

## Cache TTL Guidelines
| Data Type | TTL | Reason |
|-----------|-----|--------|
| Services list | 1 hour | Rarely changes |
| Product catalog | 30 min | Moderate updates |
| Available slots | 5 min | Real-time needed |
| Pet profile | 15 min | Balance freshness |
| Static content | 24 hours | Very stable |

## Related Files
- `lib/cache/` - Caching utilities
- `app/api/*/route.ts` - API routes
- `lib/upstash/` - Upstash configuration

## Estimated Effort
- 10 hours
  - Redis setup: 2h
  - Caching utilities: 2h
  - Endpoint integration: 4h
  - Monitoring: 2h
