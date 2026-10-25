import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0";
import { isPublicPath, loginUrl } from "@/lib/routes";

export async function proxy(request: NextRequest) {
  // Handles /auth/* (login, callback, logout) and keeps the session cookie rolling.
  const authResponse = await auth0.middleware(request);

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/auth/") || isPublicPath(pathname)) {
    return authResponse;
  }

  const session = await auth0.getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL(loginUrl(pathname + search), request.url));
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
