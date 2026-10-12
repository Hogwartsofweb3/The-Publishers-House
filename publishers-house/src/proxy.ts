import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

function logicalPath(hostname: string, pathname: string) {
  if (hostname.includes("cms.thepublishershouse.org") && !pathname.startsWith("/cms")) {
    return `/cms${pathname === "/" ? "" : pathname}`;
  }
  if (hostname.includes("portal.thepublishershouse.org") && !pathname.startsWith("/portal")) {
    return `/portal${pathname === "/" ? "" : pathname}`;
  }
  return pathname;
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const pathname = logicalPath(hostname, url.pathname);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const isPortalLogin = pathname === "/portal/login";
  const isCmsLogin = pathname === "/cms/login";
  const needsPortal = pathname.startsWith("/portal") && !isPortalLogin;
  const needsCms = pathname.startsWith("/cms") && !isCmsLogin;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if ((needsPortal || needsCms) && !hasSession) {
    const loginPath = needsCms ? "/cms/login" : "/portal/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (pathname !== url.pathname) {
    return NextResponse.rewrite(new URL(pathname, request.url), {
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
