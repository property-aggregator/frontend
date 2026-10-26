import { NextResponse, type NextRequest } from "next/server";
import { getTermsAccepted } from "@/features/account/terms-gate";
import { safeReturnTo } from "@/features/consents/return-to";
import { auth0 } from "@/lib/auth0";
import { isPublicPath, loginUrl, routes } from "@/lib/routes";

/** A redirect that keeps the session cookies Auth0 may have refreshed during this request. */
function redirectTo(path: string, request: NextRequest, authResponse: NextResponse) {
	const redirect = NextResponse.redirect(new URL(path, request.url));
	authResponse.headers.getSetCookie().forEach((cookie) => redirect.headers.append("set-cookie", cookie));
	return redirect;
}

export async function proxy(request: NextRequest) {
	// Handles /auth/* (login, callback, logout) and keeps the session cookie rolling.
	const authResponse = await auth0.middleware(request);

	const { pathname, search } = request.nextUrl;

	// Decided here rather than in the pages, so there is no flash of a page the user is about to leave.
	// Only these two pages: /regulamin and /polityka-prywatnosci are linked from /zgody and must stay reachable.
	if ((pathname === routes.home || pathname === routes.consents) && (await auth0.getSession(request))) {
		const accepted = await getTermsAccepted(request, authResponse);
		if (pathname === routes.home && accepted === false) {
			return redirectTo(routes.consents, request, authResponse);
		}
		if (pathname === routes.consents && accepted === true) {
			return redirectTo(safeReturnTo(request.nextUrl.searchParams.get("returnTo")), request, authResponse);
		}
	}

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
