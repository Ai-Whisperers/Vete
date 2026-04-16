import { NextResponse } from 'next/server';

/**
 * Set Content Security Policy (CSP) headers
 * @param response NextResponse object
 */
export function setCSPHeaders(response: NextResponse) {
  const cspPolicy = `
    default-src 'self';
    script-src 'self' https://cdn.jsdelivr.net https://unpkg.com;
    style-src 'self' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data:;
    object-src 'none';
    frame-src 'none';
    upgrade-insecure-requests;
  `;

  response.headers.set('Content-Security-Policy', cspPolicy);
}