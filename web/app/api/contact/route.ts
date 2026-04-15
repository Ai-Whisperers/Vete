import { NextRequest, NextResponse } from 'next/server'
import { withSwrCache } from '../../lib/api/caching'

export async function GET(req: NextRequest) {
  // Existing implementation
  const body = await req.json()
  const { name, email, phone, country, programInterest, objective, locale } = body

  // ...

  return NextResponse.json({ success: true })
}

export const POST = withSwrCache(async (req: NextRequest) => {
  // Existing implementation
  const body = await req.json()
  const { name, email, phone, country, programInterest, objective, locale } = body

  // ...

  return NextResponse.json({ success: true })
})