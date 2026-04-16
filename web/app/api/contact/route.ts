import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, country, programInterest, objective, locale } = body

    // Honeypot check — bots that fill the hidden "website" field get a silent success
    if (body.website) {
      return NextResponse.json({ success: true })
    }

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

    // Store lead in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error: dbError } = await supabase.from('leads').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      country: country.trim(),
      program_interest: programInterest || 'unsure',
      objective: objective?.trim() || null,
      locale: locale || 'nl',
      source: req.headers.get('referer') || null,
    })

    if (dbError) {
      console.error('LEALTIS lead DB error:', dbError)
      return NextResponse.json({ error: 'Failed to save enquiry' }, { status: 500 })
    }

    // Send email notifications via Resend (if configured)
    const resendKey = process.env.RESEND_API_KEY
    const teamEmail = process.env.TEAM_NOTIFICATION_EMAIL
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@lealtis.com'

    if (resendKey && teamEmail) {
      const programLabels: Record<string, string> = {
        business: 'Paraguay Business (USD 4,400)',
        investor: 'Paraguay Investor Program (USD 6,900)',
        unsure: 'Not sure yet',
      }

      // Team notification
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `LEALTIS <${fromEmail}>`,
          to: [teamEmail],
          subject: `New LEALTIS enquiry — ${name} (${country})`,
          html: `
            <h2 style="color:#1B3A6B">New enquiry received</h2>
            <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif">
              <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold;width:160px">Name</td><td style="padding:10px">${name}</td></tr>
              <tr><td style="padding:10px;font-weight:bold">Email</td><td style="padding:10px"><a href="mailto:${email}" style="color:#1B3A6B">${email}</a></td></tr>
              ${phone ? `<tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Phone</td><td style="padding:10px">${phone}</td></tr>` : ''}
              <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Country</td><td style="padding:10px">${country}</td></tr>
              <tr><td style="padding:10px;font-weight:bold">Program</td><td style="padding:10px"><strong style="color:#C9A84C">${programLabels[programInterest] || programInterest || 'Not specified'}</strong></td></tr>
              <tr style="background:#f5f5f5"><td style="padding:10px;font-weight:bold">Language</td><td style="padding:10px">${(locale || 'nl').toUpperCase()}</td></tr>
              ${objective ? `<tr><td style="padding:10px;font-weight:bold;vertical-align:top">Objective</td><td style="padding:10px">${objective}</td></tr>` : ''}
            </table>
          `,
        }),
      })

      // Client confirmation (language-aware)
      const confirmations: Record<string, { subject: string; greeting: string; body: string }> = {
        nl: {
          subject: 'Uw aanvraag bij LEALTIS — we nemen snel contact op',
          greeting: `Beste ${name},`,
          body: 'Bedankt voor uw interesse in LEALTIS. We hebben uw aanvraag ontvangen en nemen binnen 24 uur contact met u op om een gratis gesprek in te plannen.',
        },
        en: {
          subject: 'Your enquiry to LEALTIS — we will be in touch shortly',
          greeting: `Dear ${name},`,
          body: 'Thank you for your interest in LEALTIS. We have received your enquiry and will contact you within 24 hours to schedule a free consultation.',
        },
        de: {
          subject: 'Ihre Anfrage bei LEALTIS — wir melden uns bald',
          greeting: `Liebe/r ${name},`,
          body: 'Vielen Dank für Ihr Interesse an LEALTIS. Wir haben Ihre Anfrage erhalten und werden uns innerhalb von 24 Stunden melden, um ein kostenloses Beratungsgespräch zu vereinbaren.',
        },
        es: {
          subject: 'Su consulta a LEALTIS — nos pondremos en contacto pronto',
          greeting: `Estimado/a ${name},`,
          body: 'Gracias por su interés en LEALTIS. Hemos recibido su consulta y nos pondremos en contacto en las próximas 24 horas para agendar una consulta gratuita.',
        },
      }

      const msg = confirmations[locale] || confirmations.en

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `LEALTIS <${fromEmail}>`,
          to: [email],
          subject: msg.subject,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#1B3A6B;padding:24px;text-align:center">
                <h1 style="color:#C9A84C;margin:0;font-size:28px;letter-spacing:2px">LEALTIS</h1>
              </div>
              <div style="padding:32px">
                <p>${msg.greeting}</p>
                <p>${msg.body}</p>
                <p style="margin-top:32px;color:#666;font-size:14px">LEALTIS — Paraguay establishment for Europeans</p>
              </div>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('LEALTIS contact API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
