import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { authedApi, publicApi } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { components, paths } from "@/lib/api/schema";

export type Property = components["schemas"]["PropertyResponse"];
export type PagedProperties = components["schemas"]["PagedResponseOfPropertyResponse"];
export type PropertySearchQuery = NonNullable<paths["/api/properties"]["get"]["parameters"]["query"]>;
export type SearchLocation = components["schemas"]["LocationResponse"];
export type LocationSuggestion = components["schemas"]["LocationSuggestionResponse"];

/** Public: the 6 newest active properties. */
export async function getLatestProperties(): Promise<Property[]> {
	"use cache";
	cacheLife("minutes");
	cacheTag("properties:latest");

	return unwrap(await publicApi.GET("/api/properties/latest"));
}

export async function searchProperties(query: PropertySearchQuery): Promise<PagedProperties> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/properties", { params: { query } }));
}

export async function suggestLocations(query: string): Promise<LocationSuggestion[]> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/locations/suggest", { params: { query: { Query: query, Limit: 8 } } }));
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
