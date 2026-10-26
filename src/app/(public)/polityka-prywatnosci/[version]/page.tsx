import type { Metadata } from "next";
import { privacy } from "@/features/legal/documents";
import { LegalArchivePage } from "@/features/legal/legal-document-page";

export const metadata: Metadata = { title: `${privacy.title} (wersja archiwalna)` };

export function generateStaticParams() {
	return privacy.versions.map(({ effectiveFrom }) => ({ version: effectiveFrom }));
}

export default function PrivacyVersionPage({ params }: PageProps<"/polityka-prywatnosci/[version]">) {
	return <LegalArchivePage document={privacy} params={params} />;
}
