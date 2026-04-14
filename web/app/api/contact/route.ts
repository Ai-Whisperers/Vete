import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, country, programInterest, objective, locale } = body

    // Validate required fields
    if (!name || !email || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, country' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Log lead for now (in production: store in Supabase + send email)
    console.log('New LEALTIS lead:', {
      name,
      email,
      phone,
      country,
      programInterest,
      objective,
      locale,
      timestamp: new Date().toISOString(),
    })

    // TODO: Add Supabase insert when DB is configured
    // TODO: Add Resend email notification when email service is configured

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
