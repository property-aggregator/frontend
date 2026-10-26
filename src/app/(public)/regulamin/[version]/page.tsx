import type { Metadata } from "next";
import { terms } from "@/features/legal/documents";
import { LegalArchivePage } from "@/features/legal/legal-document-page";

export const metadata: Metadata = { title: `${terms.title} (wersja archiwalna)` };

export function generateStaticParams() {
	return terms.versions.map(({ effectiveFrom }) => ({ version: effectiveFrom }));
}

export default function TermsVersionPage({ params }: PageProps<"/regulamin/[version]">) {
	return <LegalArchivePage document={terms} params={params} />;
}
