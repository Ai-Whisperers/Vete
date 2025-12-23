import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock drizzle and db
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

vi.mock('@/db/schema', () => ({
  systemConfigs: {
    tenantId: 'tenant_id',
    key: 'key',
    id: 'id',
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  withActionAuth: vi.fn((handler) => (async (...args: any[]) => {
    // Simulate admin profile
    return handler({ profile: { role: 'admin', tenant_id: 'adris' } }, ...args);
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { setSystemConfig } from '@/app/actions/system-configs';

describe('System Config Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully set a new config', async () => {
    const result = await setSystemConfig('adris', 'test_key', 'test_value');
    expect(result.success).toBe(true);
  });
});
