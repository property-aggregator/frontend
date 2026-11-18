"use server";

import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { propertyUrl } from "@/lib/routes";
import { findPropertyIdByUrl } from "./api";

/** `fieldError` is a problem with the link itself; `notice` is any other outcome, shown apart from the field. */
export type FindPropertyState = {
	url?: string;
	fieldError?: string;
	notice?: { title: string; text: string };
};

export async function findPropertyByUrl(_previous: FindPropertyState, formData: FormData): Promise<FindPropertyState> {
	const value = formData.get("url");
	const url = typeof value === "string" ? value.trim() : "";
	if (url === "") {
		return { fieldError: "Wklej link do ogłoszenia." };
	}

	let id: string | null;
	try {
		id = await findPropertyIdByUrl(url);
	} catch (error) {
		if (!(error instanceof ApiError)) {
			throw error;
		}
		if (error.status === 400) {
			return { url, fieldError: "To nie wygląda na poprawny link. Wklej pełny adres ogłoszenia." };
		}
		return {
			url,
			notice: { title: "Nie udało się wyszukać oferty", text: "Spróbuj ponownie za chwilę." },
		};
	}

	if (id === null) {
		return {
			url,
			notice: {
				title: "Niestety nie znaleziono oferty z tego linku",
				text: "Może pochodzić z portalu, którego jeszcze nie obsługujemy.",
			},
		};
	}

	redirect(propertyUrl(id));
}
