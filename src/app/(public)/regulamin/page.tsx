import type { Metadata } from "next";
import { terms } from "@/features/legal/documents";
import { LegalDocumentPage } from "@/features/legal/legal-document-page";

export const metadata: Metadata = { title: terms.title };

export default function TermsPage() {
	return <LegalDocumentPage document={terms} version={terms.versions[0]} />;
}
