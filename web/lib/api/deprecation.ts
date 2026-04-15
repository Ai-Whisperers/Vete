import { NextResponse } from 'next/server'

export function withDeprecationNotice(version: string) {
  return async (request: Request) => {
    const response = await NextResponse.json({ version })
    response.headers.set('Deprecation', `Version ${version} will be deprecated in 6 months`)
    return response
  }
}