import { routes } from "@/lib/routes";

/** Only same-site paths are allowed, so the consents page can't be used as an open redirect. */
export function safeReturnTo(value: unknown): string {
	if (
		typeof value !== "string" ||
		!value.startsWith("/") ||
		value.startsWith("//") ||
		value.includes("\\") ||
		value.startsWith("/auth/")
	) {
		return routes.properties;
	}

	return value;
}
