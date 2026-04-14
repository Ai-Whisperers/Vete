import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = contactSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }
    
    const { name, email, phone, message } = validation.data
    
    console.log('[LEALTIS Contact] New submission:', { name, email, phone, message })
    
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'LEALTIS Website <hello@lealtis.com>',
            to: ['hello@lealtis.com'],
            subject: `New Contact: ${name}`,
            text: `
New contact form submission:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}
            `.trim(),
            reply_to: email,
          }),
        })
        
        if (!res.ok) {
          const error = await res.text()
          console.error('[LEALTIS Contact] Resend error:', error)
        }
      } catch (emailError) {
        console.error('[LEALTIS Contact] Email error:', emailError)
      }
    }
    
    return NextResponse.json({ success: true, message: 'Thank you for your message!' })
  } catch (error) {
    console.error('[LEALTIS Contact] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}