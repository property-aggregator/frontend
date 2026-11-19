import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicApi } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { components } from "@/lib/api/schema";

export type Plan = components["schemas"]["PlanResponse"];
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
