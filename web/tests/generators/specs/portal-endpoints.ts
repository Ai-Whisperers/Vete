/**
 * Tests for portal endpoints.
 * @module tests/generators/specs/portal-endpoints
 */

import { getPortalEndpoints, createPortalEndpoint } from '../../lib/api';

describe('Portal Endpoints', () => {
  it('should retrieve a list of portal endpoints', async () => {
    const portalEndpoints = await getPortalEndpoints();
    expect(portalEndpoints).toBeInstanceOf(Array);
  });

  it('should create a new portal endpoint', async () => {
    const portalEndpoint = {
      name: 'Example Portal Endpoint',
      url: 'https://example.com',
    };
    const createdPortalEndpoint = await createPortalEndpoint(portalEndpoint);
    expect(createdPortalEndpoint).toHaveProperty('id');
    expect(createdPortalEndpoint).toHaveProperty('name', portalEndpoint.name);
    expect(createdPortalEndpoint).toHaveProperty('url', portalEndpoint.url);
  });
});