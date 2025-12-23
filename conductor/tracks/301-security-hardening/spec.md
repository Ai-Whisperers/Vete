# Track 301: Security Hardening

## Goal

Secure the application against abuse and unauthorized access by implementing Rate Limiting and auditing sensitive endpoints.

## Context

- **SEC-010**: Currently, no rate limiting is enforced, making the app vulnerable to brute-force and DoS.
- Access Control was recently improved, but public APIs (Auth, Search) need specific protection.

## Requirements

1.  **Rate Limiting**:
    - Implement per-route rate limiting using the `lib/rate-limit.ts` utility (or `upstash/ratelimit` if dependencies permit).
    - **Auth Routes** (`/auth/*`): Strict limit (e.g., 5 attempts/min).
    - **Search Routes**: Moderate limit (e.g., 30/min).
    - **Writes**: Standard limit (e.g., 20/min).
2.  **Endpoint Audit**:
    - Verify `api/diagnosis/search`, `api/services` are correctly calling `withAuth` or have safe public access.

## Acceptance Criteria

- [ ] Brute-forcing login returns 429 Too Many Requests.
- [ ] Spamming search endpoints returns 429.
- [ ] Normal usage is unaffected.
