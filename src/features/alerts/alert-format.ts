import { marketLabels, propertyTypeLabels, transactionLabels } from "@/features/properties/search-params";
import type { NotificationFrequency, SearchAlert } from "./api";

export const frequencyLabels: Record<NotificationFrequency, string> = {
	instant: "Od razu",
	hourly: "Co godzinę",
	daily: "Raz dziennie",
};

const priceFormat = new Intl.NumberFormat("pl-PL", {
	style: "currency",
	currency: "PLN",
	notation: "compact",
	maximumFractionDigits: 1,
});
const numberFormat = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 });

/** "od 40", "do 60", "40–60", or null when neither is set. */
function range(min: number | null, max: number | null, format: (value: number) => string): string | null {
	if (min !== null && max !== null) {
		return min === max ? format(min) : `${format(min)}–${format(max)}`;
	}
	if (min !== null) {
		return `od ${format(min)}`;
	}
	return max === null ? null : `do ${format(max)}`;
}

/** E.g. "Warszawa, Mokotów". */
export function alertLocation(alert: Pick<SearchAlert, "locality" | "district">): string {
	return alert.district ? `${alert.locality.name}, ${alert.district.name}` : alert.locality.name;
}

/** E.g. "Mieszkanie • Sprzedaż • Warszawa, Mokotów". */
export function alertHeadline(alert: SearchAlert): string {
	return [
		alert.propertyType ? propertyTypeLabels[alert.propertyType] : "Każdy rodzaj",
		alert.transactionType && transactionLabels[alert.transactionType],
		alertLocation(alert),
	]
		.filter(Boolean)
		.join(" • ");
}

/** E.g. "do 600 tys. zł, od 40 m², 2–3 pokoje, rynek wtórny", or null with no criteria beyond the headline. */
export function alertCriteria(alert: SearchAlert): string | null {
	const rooms = range(alert.roomsMin, alert.roomsMax, String);
	const parts = [
		range(alert.priceMin, alert.priceMax, (value) => priceFormat.format(value)),
		range(alert.areaMin, alert.areaMax, (value) => `${numberFormat.format(value)} m²`),
		rooms && `${rooms} pok.`,
		alert.marketType && `rynek ${marketLabels[alert.marketType].toLowerCase()}`,
	].filter(Boolean);
	return parts.length > 0 ? parts.join(", ") : null;
}

/** The name an alert gets when none is typed, e.g. "Mieszkanie • Warszawa • do 600 tys. zł". */
export function defaultAlertName(criteria: Pick<SearchAlert, "propertyType" | "priceMax">, location: string): string {
	return [
		criteria.propertyType ? propertyTypeLabels[criteria.propertyType] : "Nieruchomość",
		location,
		criteria.priceMax !== null && `do ${priceFormat.format(criteria.priceMax)}`,
	]
		.filter(Boolean)
		.join(" • ");
}
