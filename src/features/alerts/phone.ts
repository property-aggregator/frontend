/** Countries SMS can be sent to; Poland first, as the default. */
export const phoneCountries = [
	{ name: "Polska", prefix: "+48" },
	{ name: "Ukraina", prefix: "+380" },
	{ name: "Niemcy", prefix: "+49" },
	{ name: "Czechy", prefix: "+420" },
	{ name: "Słowacja", prefix: "+421" },
	{ name: "Litwa", prefix: "+370" },
	{ name: "Norwegia", prefix: "+47" },
	{ name: "Irlandia", prefix: "+353" },
] as const;

export const DEFAULT_PHONE_PREFIX = phoneCountries[0].prefix;

// E.164 allows 15 digits with the country code; the shortest numbers here have 6.
export const PHONE_NUMBER_PATTERN = /^\d{6,12}$/;

/** "+48 123 456 789" → { prefix: "+48", number: "123456789" }; the longest matching prefix wins, e.g. +420 over +4. */
export function splitPhone(phone: string | null): { prefix: string; number: string } {
	if (!phone) {
		return { prefix: DEFAULT_PHONE_PREFIX, number: "" };
	}
	const country = phoneCountries
		.filter(({ prefix }) => phone.startsWith(prefix))
		.sort((a, b) => b.prefix.length - a.prefix.length)[0];
	return country
		? { prefix: country.prefix, number: phone.slice(country.prefix.length) }
		: { prefix: DEFAULT_PHONE_PREFIX, number: phone.replace(/^\+/, "") };
}

/** Spaces, dashes and a leading 0 are dropped; the result is E.164. */
export function joinPhone(prefix: string, number: string): string {
	return `${prefix}${number.replace(/[\s-]/g, "").replace(/^0+/, "")}`;
}
