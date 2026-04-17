import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import { CRM_AUTH_COOKIE, stripLocale } from './lib/session';

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(req: Parameters<typeof intlMiddleware>[0]) {
  const intlResponse = intlMiddleware(req);
  const pathname = stripLocale(req.nextUrl.pathname);
  const isLoginRoute = pathname === '/login';
  const token = req.cookies.get(CRM_AUTH_COOKIE)?.value;

  if (!token && !isLoginRoute) {
    const redirectUrl = new URL(`${req.nextUrl.pathname.startsWith('/ar') ? '/ar' : '/en'}/login`, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (token && isLoginRoute) {
    const redirectUrl = new URL(`${req.nextUrl.pathname.startsWith('/ar') ? '/ar' : '/en'}/dashboard`, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return intlResponse;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
