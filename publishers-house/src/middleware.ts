import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Rewrite cms.thepublishershouse.org to /cms
  if (hostname.includes('cms.thepublishershouse.org')) {
    if (!url.pathname.startsWith('/cms')) {
      return NextResponse.rewrite(new URL(`/cms${url.pathname}`, request.url))
    }
  }

  // Rewrite portal.thepublishershouse.org to /portal
  if (hostname.includes('portal.thepublishershouse.org')) {
    if (!url.pathname.startsWith('/portal')) {
      return NextResponse.rewrite(new URL(`/portal${url.pathname}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
