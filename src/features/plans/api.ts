import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { authedApi, publicApi } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { components } from "@/lib/api/schema";

export type Plan = components["schemas"]["PlanResponse"];
export type PlanQuote = components["schemas"]["PlanQuoteResponse"];
export type PlanOffer = components["schemas"]["PlanOfferResponse"];
export type PlanEntitlements = components["schemas"]["PlanEntitlementsResponse"];
export type UserPlan = components["schemas"]["UserPlan"];

/** Public: every plan with its entitlements and one-off offers (PLN gross). */
export async function getPlans(): Promise<Plan[]> {
	"use cache";
	cacheLife("hours");
	cacheTag("plans");

	return unwrap(await publicApi.GET("/api/plans"));
}

export type QuoteResult =
	| { quote: PlanQuote }
	| { error: "not_found" | "invalid_promo_code" | "plan_lower_than_current" }
	| { error: "too_many_requests"; retryAfterSeconds: number | null };

export async function getQuote(offerId: string, promoCode?: string): Promise<QuoteResult> {
	const api = await authedApi();
	const result = await api.GET("/api/plans/offers/{id}/quote", {
		params: { path: { id: offerId }, query: promoCode ? { promoCode } : {} },
	});
	const code = result.error?.code;

	if (result.response.status === 404) return { error: "not_found" };
	if (code === "invalid_promo_code" || code === "plan_lower_than_current") return { error: code };
	if (code === "too_many_requests") {
		const retryAfter = Number(result.response.headers.get("Retry-After"));
		return { error: code, retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null };
	}

	return { quote: unwrap(result) };
}
