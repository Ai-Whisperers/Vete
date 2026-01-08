# OPS-001: API Documentation (OpenAPI/Swagger)

## Priority: P2
## Category: Operations
## Status: Not Started
## Epic: [EPIC-11: Operations & Observability](../epics/EPIC-11-operations.md)

## Description
Generate comprehensive API documentation using OpenAPI/Swagger specification to enable client SDK generation, improve developer experience, and ensure API contract clarity.

## Current State
- 269 API route files exist
- No centralized API documentation
- Developers must read source code to understand endpoints
- No automated client generation possible

## Proposed Solution
Implement automatic OpenAPI spec generation from Next.js route handlers using a library like `next-swagger-doc` or custom extraction.

### Implementation Approach
```typescript
// lib/api/openapi.ts
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Vete Platform API',
        version: '1.0.0',
        description: 'Multi-tenant veterinary clinic management API',
      },
      servers: [
        { url: 'https://api.vete.com', description: 'Production' },
        { url: 'http://localhost:3000', description: 'Development' },
      ],
    },
  });
  return spec;
};
```

### Documentation UI
```typescript
// app/api/docs/route.ts
import SwaggerUI from 'swagger-ui-react';

export default function ApiDocsPage() {
  return <SwaggerUI url="/api/openapi.json" />;
}
```

## Implementation Steps
1. Install `next-swagger-doc` and `swagger-ui-react` packages
2. Add JSDoc comments to all API route handlers
3. Create OpenAPI spec generation endpoint
4. Set up Swagger UI documentation page
5. Add authentication documentation
6. Document request/response schemas
7. Add examples for each endpoint
8. Set up CI to validate OpenAPI spec

## Acceptance Criteria
- [ ] OpenAPI 3.0 spec generated from routes
- [ ] Swagger UI accessible at `/api/docs`
- [ ] All 269 endpoints documented
- [ ] Request/response schemas included
- [ ] Authentication requirements documented
- [ ] Rate limiting documented
- [ ] Spanish error messages documented

## Related Files
- `app/api/**/*.ts` - All API routes
- `lib/schemas/*.ts` - Zod schemas (convert to JSON Schema)

## Estimated Effort
- 8 hours
  - Setup & configuration: 2h
  - JSDoc annotations: 4h
  - UI & polish: 2h

## Notes
- Consider generating TypeScript SDK from OpenAPI spec
- Add to CI/CD to catch documentation drift
