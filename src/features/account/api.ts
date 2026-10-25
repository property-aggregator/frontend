import "server-only";
import { cache } from "react";
import { authedApi } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { components } from "@/lib/api/schema";

export type CurrentUser = components["schemas"]["CurrentUserResponse"];
export type AcceptConsentsRequest = components["schemas"]["AcceptConsentsRequest"];

/** Deduplicated per request, so layouts and pages can all call it. */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const api = await authedApi();
  return unwrap(await api.GET("/api/me"));
});

/** Throws ApiError with code terms_must_be_accepted (400) when acceptTerms is false. */
export async function acceptConsents(body: AcceptConsentsRequest): Promise<void> {
  const api = await authedApi();
  unwrap(await api.POST("/api/me/consents", { body }));
}

export async function setMarketingConsent(granted: boolean): Promise<void> {
  const api = await authedApi();
  unwrap(await api.PUT("/api/me/consents/marketing", { body: { granted } }));
}
