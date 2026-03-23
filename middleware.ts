import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple locale detection — read from cookie or Accept-Language header
  // Set locale cookie if not present so next-intl can pick it up
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie) return NextResponse.next();

  // Auto-detect from Accept-Language header
  const acceptLang = request.headers.get('accept-language') || '';
  const supported = ['en', 'hi', 'es', 'fr', 'de', 'pt'];
  let detected = 'en';
  for (const lang of supported) {
    if (acceptLang.toLowerCase().includes(lang)) {
      detected = lang;
      break;
    }
  }

  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', detected, { path: '/', maxAge: 31536000 });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
