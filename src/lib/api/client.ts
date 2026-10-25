import "server-only";
import { AccessTokenError } from "@auth0/nextjs-auth0/errors";
import { redirect } from "next/navigation";
import createClient from "openapi-fetch";
import { auth0 } from "@/lib/auth0";
import { env } from "@/lib/env";
import { routes } from "@/lib/routes";
import type { paths } from "./schema";

/** For anonymous endpoints, e.g. GET /api/properties/latest. Safe to use inside "use cache". */
export const publicApi = createClient<paths>({ baseUrl: env.API_BASE_URL });

async function getAccessToken(): Promise<string> {
  try {
    const { token } = await auth0.getAccessToken();
    return token;
  } catch (error) {
    if (error instanceof AccessTokenError) {
      redirect(routes.login);
    }
    throw error;
  }
}

/** For endpoints that require sign-in. Reads the session, so never call it inside "use cache". */
export async function authedApi() {
  const token = await getAccessToken();
  return createClient<paths>({
    baseUrl: env.API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
}
