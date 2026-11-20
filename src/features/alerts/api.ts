import "server-only";
import { authedApi } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { components } from "@/lib/api/schema";

export type SearchAlert = components["schemas"]["SearchAlertResponse"];
export type SearchAlertRequest = components["schemas"]["SearchAlertRequest"];
export type NotificationFrequency = components["schemas"]["NotificationFrequency"];
export type NotificationSettings = components["schemas"]["NotificationSettingsResponse"];

export async function getSearchAlerts(): Promise<SearchAlert[]> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/search-alerts"));
}

/** Throws ApiError: 400 invalid_search_alert_location, 403 search_alerts_not_in_plan, 409 search_alerts_limit_reached. */
export async function createSearchAlert(body: SearchAlertRequest): Promise<SearchAlert> {
	const api = await authedApi();
	return unwrap(await api.POST("/api/search-alerts", { body }));
}

export async function replaceSearchAlert(id: string, body: SearchAlertRequest): Promise<SearchAlert> {
	const api = await authedApi();
	return unwrap(await api.PUT("/api/search-alerts/{id}", { params: { path: { id } }, body }));
}

export async function setSearchAlertActive(id: string, isActive: boolean): Promise<SearchAlert> {
	const api = await authedApi();
	return unwrap(await api.PUT("/api/search-alerts/{id}/active", { params: { path: { id } }, body: { isActive } }));
}

export async function deleteSearchAlert(id: string): Promise<void> {
	const api = await authedApi();
	unwrap(await api.DELETE("/api/search-alerts/{id}", { params: { path: { id } } }));
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/me/notification-settings"));
}

/** Full replacement: null clears a contact. The phone is in E.164, e.g. +48123456789. */
export async function updateNotificationSettings(body: NotificationSettings): Promise<NotificationSettings> {
	const api = await authedApi();
	return unwrap(await api.PUT("/api/me/notification-settings", { body }));
}
