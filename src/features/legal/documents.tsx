import { routes } from "@/lib/routes";

export type LegalVersion = {
	effectiveFrom: string;
	content: React.ReactNode;
};

export type LegalDocument = {
	title: string;
	path: string;
	versions: LegalVersion[];
};

// Newest first: the first version is the one currently in force. Never edit a published version, add a new one.
export const terms: LegalDocument = {
	title: "Regulamin",
	path: routes.terms,
	versions: [
		{
			effectiveFrom: "2026-10-26",
			content: <p>Tutaj pojawi się regulamin serwisu.</p>,
		},
	],
};

export const privacy: LegalDocument = {
	title: "Polityka prywatności",
	path: routes.privacy,
	versions: [
		{
			effectiveFrom: "2026-10-26",
			content: <p>Tutaj pojawi się polityka prywatności serwisu.</p>,
		},
	],
};
