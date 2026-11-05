import { z } from "zod";
import type { components } from "@/lib/api/schema";
import type { PropertySearchQuery } from "./api";

type Schemas = components["schemas"];

export const PAGE_SIZE = 20;
export const LOCATION_QUERY_MIN_LENGTH = 2;
export const LOCATION_QUERY_MAX_LENGTH = 100;
export const MAX_DISTRICTS = 25;

export const locationTypeLabels: Record<Schemas["LocationType"], string> = {
	voivodeship: "województwo",
	county: "powiat",
	municipality: "gmina",
	locality: "miejscowość",
	district: "dzielnica",
};

export const transactionLabels: Record<Schemas["TransactionType"], string> = { sale: "Sprzedaż", rent: "Wynajem" };
export const propertyTypeLabels: Record<Schemas["PropertyType"], string> = {
	apartment: "Mieszkanie",
	house: "Dom",
	plot: "Działka",
};
export const marketLabels: Record<Schemas["MarketType"], string> = { primary: "Pierwotny", secondary: "Wtórny" };
export const statusLabels = { active: "Aktywne", archived: "Archiwalne", all: "Wszystkie" } as const;
export const sortLabels: Record<Schemas["PropertySort"], string> = {
	newest: "Najnowsze",
	priceAscending: "Cena: od najniższej",
	priceDescending: "Cena: od najwyższej",
};

// Left out of the URL and not counted as active filters.
export const defaultFilters = { status: "active", sort: "newest" } as const;

export function isDefaultFilter(key: string, value: unknown): boolean {
	return defaultFilters[key as keyof typeof defaultFilters] === value;
}

function keys<T extends string>(labels: Record<T, string>) {
	return Object.keys(labels) as [T, ...T[]];
}

// URL values are user-editable: anything malformed is dropped instead of failing the page.
const first = (value: unknown) => (Array.isArray(value) ? value[0] : value);
const blankToUndefined = (value: unknown) => {
	const single = first(value);
	return typeof single === "string" && single.trim() === "" ? undefined : single;
};
const uuid = z.preprocess(blankToUndefined, z.uuid().optional()).catch(undefined);
const uuids = (max: number) => z.preprocess((value) => [value ?? []].flat(), z.array(z.uuid()).max(max)).catch([]);
const amount = z.preprocess(blankToUndefined, z.coerce.number().nonnegative().optional()).catch(undefined);
const count = z.preprocess(blankToUndefined, z.coerce.number().int().nonnegative().optional()).catch(undefined);
const oneOf = <T extends string>(labels: Record<T, string>) =>
	z.preprocess(blankToUndefined, z.enum(keys(labels)).optional()).catch(undefined);
const oneOfWithDefault = <T extends string>(labels: Record<T, string>, fallback: NoInfer<T>) =>
	oneOf(labels).transform((value) => value ?? fallback);

const searchFiltersSchema = z.object({
	locationId: uuid,
	district: uuids(MAX_DISTRICTS),
	transaction: oneOf(transactionLabels),
	type: oneOf(propertyTypeLabels),
	market: oneOf(marketLabels),
	status: oneOfWithDefault(statusLabels, defaultFilters.status),
	minPrice: amount,
	maxPrice: amount,
	minArea: amount,
	maxArea: amount,
	minRooms: count,
	maxRooms: count,
	sort: oneOfWithDefault(sortLabels, defaultFilters.sort),
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
		LocationIds: locationIds(filters),
		TransactionType: enumValue(filters.transaction),
		PropertyType: enumValue(filters.type),
		MarketType: enumValue(filters.market),
		IsArchived: filters.status === "all" ? undefined : filters.status === "archived",
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

// The API matches any of the ids, so the locality itself would cancel out its districts.
function locationIds({ locationId, district }: SearchFilters): string[] | undefined {
	if (district.length > 0) {
		return district;
	}
	return locationId ? [locationId] : undefined;
}

export function toSearchParams(filters: SearchFilters): URLSearchParams {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(filters)) {
		for (const item of [value].flat()) {
			if (item !== undefined && !isDefaultFilter(key, item)) {
				params.append(key, String(item));
			}
		}
	}
	return params;
}
