"use server";

import { z } from "zod";
import { getCurrentUser } from "@/features/account/api";
import { ApiError } from "@/lib/api/errors";
import type { components } from "@/lib/api/schema";
import {
	createSearchAlert,
	deleteSearchAlert,
	replaceSearchAlert,
	setSearchAlertActive,
	updateNotificationSettings,
	type NotificationSettings,
	type SearchAlert,
	type SearchAlertRequest,
} from "./api";

export type AlertResult = { alert?: SearchAlert; error?: string };
export type SettingsResult = { settings?: NotificationSettings; error?: string; field?: "email" | "phone" };

type ValidationProblem = components["schemas"]["HttpValidationProblemDetails"];

const amount = z.number().nonnegative().nullable();
const count = z.number().int().nonnegative().nullable();
const time = z
	.string()
	.regex(/^\d{2}:\d{2}(:\d{2})?$/)
	.nullable();

const alertSchema = z.object({
	name: z.string().trim().min(1).max(100),
	propertyType: z.enum(["apartment", "house", "plot"]).nullable(),
	transactionType: z.enum(["sale", "rent"]).nullable(),
	marketType: z.enum(["primary", "secondary"]).nullable(),
	priceMin: amount,
	priceMax: amount,
	areaMin: amount,
	areaMax: amount,
	roomsMin: count,
	roomsMax: count,
	localityId: z.uuid(),
	districtId: z.uuid().nullable(),
	emailEnabled: z.boolean(),
	smsEnabled: z.boolean(),
	notificationFrequency: z.enum(["instant", "hourly", "daily"]),
	quietHoursStart: time,
	quietHoursEnd: time,
}) satisfies z.ZodType<SearchAlertRequest>;

const id = z.uuid();

const fieldErrors: Partial<Record<NonNullable<ValidationProblem["errors"]>[string][number], string>> = {
	max_less_than_min: "Wartość „do” nie może być mniejsza niż „od”.",
	quiet_hours_incomplete: "Podaj obie godziny ciszy nocnej albo żadnej.",
	too_long: "Nazwa jest za długa.",
	out_of_range: "Któraś z wartości jest poza dozwolonym zakresem.",
};

/** The first known message among the field errors of a 400, if any. */
function validationMessage(error: ApiError): string | undefined {
	const errors = (error.problem as ValidationProblem | undefined)?.errors ?? {};
	return Object.values(errors)
		.flat()
		.map((code) => fieldErrors[code])
		.find(Boolean);
}

async function alertError(error: unknown): Promise<AlertResult> {
	if (!(error instanceof ApiError)) {
		throw error;
	}
	switch (error.code) {
		case "search_alerts_limit_reached": {
			const { activeAlertsLimit } = (await getCurrentUser()).entitlements;
			return {
				error: `Twój plan pozwala na ${activeAlertsLimit} aktywnych alertów. Wyłącz któryś albo wybierz wyższy plan.`,
			};
		}
		case "search_alerts_not_in_plan":
			return { error: "Alerty nie są dostępne w Twoim planie." };
		case "invalid_search_alert_location":
			return { error: "Wybierz miejscowość z listy podpowiedzi." };
		case "search_alert_not_found":
			return { error: "Ten alert już nie istnieje. Odśwież stronę." };
	}
	if (error.status === 400) {
		return { error: validationMessage(error) ?? "Sprawdź kryteria alertu." };
	}
	return { error: "Nie udało się zapisać alertu. Spróbuj ponownie za chwilę." };
}

export async function saveAlert(alertId: string | null, request: SearchAlertRequest): Promise<AlertResult> {
	const parsed = alertSchema.safeParse(request);
	if (!parsed.success || (alertId !== null && !id.safeParse(alertId).success)) {
		return { error: "Sprawdź kryteria alertu." };
	}

	try {
		return {
			alert: alertId ? await replaceSearchAlert(alertId, parsed.data) : await createSearchAlert(parsed.data),
		};
	} catch (error) {
		return alertError(error);
	}
}

export async function setAlertActive(alertId: string, isActive: boolean): Promise<AlertResult> {
	if (!id.safeParse(alertId).success || typeof isActive !== "boolean") {
		return { error: "Nieprawidłowy alert." };
	}

	try {
		return { alert: await setSearchAlertActive(alertId, isActive) };
	} catch (error) {
		return alertError(error);
	}
}

export async function removeAlert(alertId: string): Promise<{ error?: string }> {
	if (!id.safeParse(alertId).success) {
		return { error: "Nieprawidłowy alert." };
	}

	try {
		await deleteSearchAlert(alertId);
		return {};
	} catch (error) {
		if (error instanceof ApiError && error.code === "search_alert_not_found") {
			return {};
		}
		return alertError(error);
	}
}

const settingsSchema = z.object({
	email: z.email().max(254).nullable(),
	phone: z
		.string()
		.regex(/^\+\d{8,15}$/)
		.nullable(),
});

export async function saveNotificationSettings(settings: NotificationSettings): Promise<SettingsResult> {
	const parsed = settingsSchema.safeParse(settings);
	if (!parsed.success) {
		const field = parsed.error.issues[0]?.path[0] === "phone" ? "phone" : "email";
		return { field, error: field === "phone" ? "Nieprawidłowy numer telefonu." : "Nieprawidłowy adres e-mail." };
	}

	try {
		return { settings: await updateNotificationSettings(parsed.data) };
	} catch (error) {
		if (!(error instanceof ApiError)) {
			throw error;
		}
		const errors = (error.problem as ValidationProblem | undefined)?.errors ?? {};
		if (errors.phone) {
			return { field: "phone", error: "Nieprawidłowy numer telefonu." };
		}
		if (errors.email) {
			return { field: "email", error: "Nieprawidłowy adres e-mail." };
		}
		return { error: "Nie udało się zapisać danych kontaktowych. Spróbuj ponownie za chwilę." };
	}
}
