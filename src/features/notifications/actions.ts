"use server";

import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { getNotifications, type NotificationsPage } from "./api";

const id = z.uuid();

export async function loadOlderNotifications(before: string): Promise<{ page?: NotificationsPage; error?: string }> {
	if (!id.safeParse(before).success) {
		return { error: "Nieprawidłowa strona powiadomień." };
	}

	try {
		return { page: await getNotifications(before) };
	} catch (error) {
		if (!(error instanceof ApiError)) {
			throw error;
		}
		return { error: "Nie udało się pobrać starszych powiadomień. Spróbuj ponownie za chwilę." };
	}
}
