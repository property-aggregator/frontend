import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { authedApi, publicApi } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { components, paths } from "@/lib/api/schema";

export type Property = components["schemas"]["PropertyResponse"];
export type PagedProperties = components["schemas"]["PagedResponseOfPropertyResponse"];
export type PropertySearchQuery = NonNullable<paths["/api/properties"]["get"]["parameters"]["query"]>;
export type DealsQuery = NonNullable<paths["/api/properties/deals"]["get"]["parameters"]["query"]>;
export type SearchLocation = components["schemas"]["LocationResponse"];
export type LocationSuggestion = components["schemas"]["LocationSuggestionResponse"];
export type PropertyTransactions = components["schemas"]["PropertyTransactionsResponse"];
export type Transaction = components["schemas"]["TransactionResponse"];
export type PriceChange = components["schemas"]["PriceChangeResponse"];

/** Public: the 6 newest active properties. */
export async function getLatestProperties(): Promise<Property[]> {
	"use cache";
	cacheLife("minutes");
	cacheTag("properties:latest");

	return unwrap(await publicApi.GET("/api/properties/latest"));
}

/** As getLatestProperties, but with isDeal and dealDiscountPercent for a plan with deals; not cached, as it is per user. */
export async function getLatestPropertiesForUser(): Promise<Property[]> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/properties/latest"));
}

export async function searchProperties(query: PropertySearchQuery): Promise<PagedProperties> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/properties", { params: { query } }));
}

/** Throws ApiError with code deals_not_in_plan (403) when the plan has no deals. */
export async function searchDeals(query: DealsQuery): Promise<PagedProperties> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/properties/deals", { params: { query } }));
}

/** includeWithoutOffers: also places with few or no offers, which search alerts can watch. */
export async function suggestLocations(query: string, includeWithoutOffers = false): Promise<LocationSuggestion[]> {
	const api = await authedApi();
	return unwrap(
		await api.GET("/api/locations/suggest", {
			params: { query: { Query: query, Limit: 8, IncludeWithoutOffers: includeWithoutOffers || undefined } },
		}),
	);
}

export async function getLocations(ids: string[]): Promise<SearchLocation[]> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/locations", { params: { query: { Ids: ids } } }));
}

export async function getDistricts(localityId: string): Promise<SearchLocation[]> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/locations/{id}/districts", { params: { path: { id: localityId } } }));
}

/** Returns null when the property does not exist, so the page can call notFound(). */
export async function getProperty(id: string): Promise<Property | null> {
	const api = await authedApi();
	const result = await api.GET("/api/properties/{id}", { params: { path: { id } } });
	if (result.response.status === 404) {
		return null;
	}

	return unwrap(result);
}

/** Returns null when no property has this url. */
export async function findPropertyIdByUrl(url: string): Promise<string | null> {
	const api = await authedApi();
	const result = await api.GET("/api/properties/by-url", { params: { query: { url } } });
	if (result.response.status === 404) {
		return null;
	}

	return unwrap(result).id;
}

export async function getPropertyTransactions(id: string): Promise<PropertyTransactions> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/properties/{id}/transactions", { params: { path: { id } } }));
}

export async function getPriceHistory(id: string): Promise<PriceChange[]> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/properties/{id}/price-history", { params: { path: { id } } }));
}

export async function getPropertyDuplicates(id: string): Promise<Property[]> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/properties/{id}/duplicates", { params: { path: { id } } }));
}

export async function getSimilarArchived(id: string): Promise<Property[]> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/properties/{id}/similar-archived", { params: { path: { id } } }));
}
