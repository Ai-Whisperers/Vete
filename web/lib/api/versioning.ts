import { NextResponse } from 'next/server'

export function withVersioning(version: string) {
  return async (request: Request) => {
    const response = await NextResponse.json({ version })
    response.headers.set('API-Version', version)
    return response
  }
}