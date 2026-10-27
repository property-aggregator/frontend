"use server";

import { getCurrentUser } from "@/features/account/api";
import { ApiError } from "@/lib/api/errors";
import { addFavorite, removeFavorite } from "./api";

export type FavoriteResult = { error?: string };

export async function setFavorite(propertyId: string, favorite: boolean): Promise<FavoriteResult> {
	if (typeof propertyId !== "string" || propertyId === "") {
		return { error: "Nieprawidłowa oferta." };
	}

	try {
		if (favorite) {
			await addFavorite(propertyId);
		} else {
			await removeFavorite(propertyId);
		}
	} catch (error) {
		if (!(error instanceof ApiError)) {
			throw error;
		}
		if (error.code === "favorites_limit_reached") {
			const { favoritesLimit } = await getCurrentUser();
			return { error: `Możesz mieć najwyżej ${favoritesLimit} ulubionych ofert. Usuń którąś, aby dodać nową.` };
		}
		if (error.code === "property_not_found") {
			return { error: "Ta oferta już nie istnieje." };
		}
		return { error: "Nie udało się zapisać. Spróbuj ponownie za chwilę." };
	}

	return {};
}
