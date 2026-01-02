import { NextRequest, NextResponse } from 'next/server';
import { locales, type Locale } from '@/i18n/config';

/**
 * POST /api/locale
 * Sets the user's preferred locale in a cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locale } = body;

    // Validate locale
    if (!locale || !locales.includes(locale as Locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true, locale });

    // Set the locale cookie
    // Max age: 1 year
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Failed to set locale' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/locale
 * Returns the current locale from cookie or default
 */
export async function GET(request: NextRequest) {
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  const locale = localeCookie && locales.includes(localeCookie as Locale)
    ? localeCookie
    : 'es';

  return NextResponse.json({ locale });
}
