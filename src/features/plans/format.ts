import type { UserPlan } from "@/features/plans/api";

export const planNames: Record<UserPlan, string> = { free: "Darmowy", plus: "Plus", pro: "Pro" };

export const priceFormat = new Intl.NumberFormat("pl-PL", {
	style: "currency",
	currency: "PLN",
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});

// A fixed time zone, so the server and the browser print the same day.
export const dateFormat = new Intl.DateTimeFormat("pl-PL", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "Europe/Warsaw",
});

export function plural(n: number, one: string, few: string, many: string): string {
	if (n === 1) return one;
	const lastTwo = n % 100;
	const last = n % 10;
	return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
}

export function months(n: number): string {
	return `${n} ${plural(n, "miesiąc", "miesiące", "miesięcy")}`;
}
