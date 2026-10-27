"use server";

import { ApiError } from "@/lib/api/errors";
import { setMarketingConsent } from "./api";

export type MarketingConsentResult = { error?: string };

export async function updateMarketingConsent(granted: boolean): Promise<MarketingConsentResult> {
	if (typeof granted !== "boolean") {
		return { error: "Nieprawidłowa wartość zgody." };
	}

	try {
		await setMarketingConsent(granted);
	} catch (error) {
		if (error instanceof ApiError) {
			return { error: "Nie udało się zapisać zgody. Spróbuj ponownie za chwilę." };
		}
		throw error;
	}

	return {};
}
