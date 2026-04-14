import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupIntegrationTest, cleanupIntegrationTest, createTestRequest } from '@/tests/__helpers__/integration-setup';
import { GET } from '../route';

describe('API: /api/health', () => {
  beforeEach(async () => {
    await setupIntegrationTest();
  });

  afterEach(async () => {
    await cleanupIntegrationTest();
  });

  it('should return 200 with health check data', async () => {
    const request = createTestRequest('http://localhost:3000/api/health');
    const response = await GET();
    expect(response.status).toBe(200);
    const jsonData = await response.json();
    expect(jsonData).toHaveProperty('status');
    expect(jsonData).toHaveProperty('timestamp');
    expect(jsonData).toHaveProperty('version');
  });

  it('should return error if database connection fails', async () => {
    // Mock the Supabase client to throw an error
    vi.mock('@/lib/supabase/server', () => ({
      createClient: vi.fn(() => {
        throw new Error('Database connection failed');
      }),
    }));

    const request = createTestRequest('http://localhost:3000/api/health');
    const response = await GET();
    expect(response.status).toBe(500);
    const jsonData = await response.json();
    expect(jsonData).toHaveProperty('status', 'error');
  });
});