"use server";

import { redirect } from "next/navigation";
import { acceptConsents } from "@/features/account/api";
import { ApiError } from "@/lib/api/errors";
import { safeReturnTo } from "./return-to";

export type ConsentsState = { error?: string };

export async function submitConsents(_previous: ConsentsState, formData: FormData): Promise<ConsentsState> {
	if (formData.get("acceptTerms") !== "on") {
		return { error: "Aby korzystać z serwisu, zaakceptuj regulamin." };
	}

	try {
		await acceptConsents({ acceptTerms: true, marketingConsent: formData.get("marketingConsent") === "on" });
	} catch (error) {
		if (error instanceof ApiError) {
			return { error: "Nie udało się zapisać zgód. Spróbuj ponownie za chwilę." };
		}
		throw error;
	}

	redirect(safeReturnTo(formData.get("returnTo")));
}
