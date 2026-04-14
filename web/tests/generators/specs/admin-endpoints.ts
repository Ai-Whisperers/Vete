/**
 * Tests for admin endpoints.
 * @module tests/generators/specs/admin-endpoints
 */

import { getAdminEndpoints, createAdminEndpoint } from '../../lib/api';

describe('Admin Endpoints', () => {
  it('should retrieve a list of admin endpoints', async () => {
    const adminEndpoints = await getAdminEndpoints();
    expect(adminEndpoints).toBeInstanceOf(Array);
  });

  it('should create a new admin endpoint', async () => {
    const adminEndpoint = {
      name: 'Example Admin Endpoint',
      url: 'https://example.com',
    };
    const createdAdminEndpoint = await createAdminEndpoint(adminEndpoint);
    expect(createdAdminEndpoint).toHaveProperty('id');
    expect(createdAdminEndpoint).toHaveProperty('name', adminEndpoint.name);
    expect(createdAdminEndpoint).toHaveProperty('url', adminEndpoint.url);
  });
});