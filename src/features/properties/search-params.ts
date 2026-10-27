import { z } from "zod";
import type { components } from "@/lib/api/schema";
import type { PropertySearchQuery } from "./api";

type Schemas = components["schemas"];

export const PAGE_SIZE = 20;

export const transactionLabels: Record<Schemas["TransactionType"], string> = { sale: "Sprzedaż", rent: "Wynajem" };
export const propertyTypeLabels: Record<Schemas["PropertyType"], string> = {
	apartment: "Mieszkanie",
	house: "Dom",
	plot: "Działka",
};
export const marketLabels: Record<Schemas["MarketType"], string> = { primary: "Pierwotny", secondary: "Wtórny" };
export const statusLabels = { active: "Aktywne", archived: "Archiwalne" } as const;
export const sortLabels: Record<NonNullable<Schemas["PropertySort"]>, string> = {
	newest: "Najnowsze",
	priceAscending: "Cena: od najniższej",
	priceDescending: "Cena: od najwyższej",
};

function keys<T extends string>(labels: Record<T, string>) {
	return Object.keys(labels) as [T, ...T[]];
}

// URL values are user-editable: anything malformed is dropped instead of failing the page.
const first = (value: unknown) => (Array.isArray(value) ? value[0] : value);
const blankToUndefined = (value: unknown) => {
	const single = first(value);
	return typeof single === "string" && single.trim() === "" ? undefined : single;
};
const text = z.preprocess(blankToUndefined, z.string().trim().max(100).optional()).catch(undefined);
const amount = z.preprocess(blankToUndefined, z.coerce.number().nonnegative().optional()).catch(undefined);
const count = z.preprocess(blankToUndefined, z.coerce.number().int().nonnegative().optional()).catch(undefined);
const oneOf = <T extends string>(labels: Record<T, string>) =>
	z.preprocess(blankToUndefined, z.enum(keys(labels)).optional()).catch(undefined);

const searchFiltersSchema = z.object({
	location: text,
	transaction: oneOf(transactionLabels),
	type: oneOf(propertyTypeLabels),
	market: oneOf(marketLabels),
	status: oneOf(statusLabels),
	minPrice: amount,
	maxPrice: amount,
	minArea: amount,
	maxArea: amount,
	minRooms: count,
	maxRooms: count,
	sort: oneOf(sortLabels),
	page: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).optional()).catch(undefined),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

export function parseSearchFilters(params: Record<string, string | string[] | undefined>): SearchFilters {
	return searchFiltersSchema.parse(params);
}

// The API binds enum query values case-sensitively to their C# names ("PriceAscending"),
// although its OpenAPI document lists them in camelCase; "priceAscending" gets a 400.
function enumValue<T extends string>(value: T | undefined): T | undefined {
	return value && ((value[0].toUpperCase() + value.slice(1)) as T);
}

export function toApiQuery(filters: SearchFilters): PropertySearchQuery {
	return {
		Location: filters.location,
		TransactionType: enumValue(filters.transaction),
		PropertyType: enumValue(filters.type),
		MarketType: enumValue(filters.market),
		IsArchived: filters.status === undefined ? undefined : filters.status === "archived",
		MinPrice: filters.minPrice,
		MaxPrice: filters.maxPrice,
		MinAreaM2: filters.minArea,
		MaxAreaM2: filters.maxArea,
		MinRooms: filters.minRooms,
		MaxRooms: filters.maxRooms,
		Sort: enumValue(filters.sort),
		Page: filters.page,
		PageSize: PAGE_SIZE,
	};
}

export function toSearchParams(filters: SearchFilters): URLSearchParams {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(filters)) {
		if (value !== undefined) {
			params.set(key, String(value));
		}
	}
	return params;
}
