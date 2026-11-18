import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Tokens from globals.css that Tailwind has no default for; otherwise cn() would not know which classes they replace.
const twMerge = extendTailwindMerge({
	extend: { classGroups: { "font-size": [{ text: ["2xs", "md"] }], shadow: [{ shadow: ["card"] }] } },
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
