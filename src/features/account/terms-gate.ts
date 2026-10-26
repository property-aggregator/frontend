import "server-only";
import createClient from "openapi-fetch";
import type { NextRequest, NextResponse } from "next/server";
import type { paths } from "@/lib/api/schema";
import { auth0 } from "@/lib/auth0";
import { env } from "@/lib/env";

/** For the proxy, which has no access to next/headers. Null when it can't be determined, e.g. the backend is down. */
export async function getTermsAccepted(request: NextRequest, response: NextResponse): Promise<boolean | null> {
	try {
		const { token } = await auth0.getAccessToken(request, response);
		const api = createClient<paths>({ baseUrl: env.API_BASE_URL, headers: { Authorization: `Bearer ${token}` } });
		const { data } = await api.GET("/api/me");
		return data?.termsAccepted ?? null;
	} catch {
		return null;
	}
}
