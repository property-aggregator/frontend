import "server-only";
import { authedApi } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Property } from "@/features/properties/api";

export async function getFavorites(): Promise<Property[]> {
  const api = await authedApi();
  return unwrap(await api.GET("/api/favorites"));
}

/** Lightweight list for marking favorites on property cards. */
export async function getFavoriteIds(): Promise<Set<string>> {
  const api = await authedApi();
  return new Set(unwrap(await api.GET("/api/favorites/ids")));
}

/** Idempotent. Throws ApiError with code favorites_limit_reached (409) or property_not_found (404). */
export async function addFavorite(propertyId: string): Promise<void> {
  const api = await authedApi();
  unwrap(await api.PUT("/api/favorites/{propertyId}", { params: { path: { propertyId } } }));
}

/** Idempotent. */
export async function removeFavorite(propertyId: string): Promise<void> {
  const api = await authedApi();
  unwrap(await api.DELETE("/api/favorites/{propertyId}", { params: { path: { propertyId } } }));
}
