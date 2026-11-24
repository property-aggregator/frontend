import "server-only";
import { authedApi } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { components } from "@/lib/api/schema";

export type Notification = components["schemas"]["NotificationResponse"];
export type NotificationsPage = components["schemas"]["NotificationsResponse"];

/** Newest first, 20 at a time; pass nextCursor of the previous page as `before`. */
export async function getNotifications(before?: string): Promise<NotificationsPage> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/notifications", { params: { query: before ? { Before: before } : {} } }));
}

export async function getUnreadNotificationsCount(): Promise<number> {
	const api = await authedApi();
	return unwrap(await api.GET("/api/notifications/unread-count")).count;
}

/** Idempotent. Throws ApiError 404 for a notification that is not the user's. */
export async function markNotificationRead(id: string): Promise<void> {
	const api = await authedApi();
	unwrap(await api.PUT("/api/notifications/{id}/read", { params: { path: { id } } }));
}
