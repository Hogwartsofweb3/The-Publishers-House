import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Rewrite cms.thepublishershouse.org to /cms
  // Note: Localhost testing can use a custom header or just direct path access
  if (hostname.includes('cms.thepublishershouse.org')) {
    // Prevent infinite loops if the path already starts with /cms
    if (!url.pathname.startsWith('/cms')) {
      return NextResponse.rewrite(new URL(`/cms${url.pathname}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
