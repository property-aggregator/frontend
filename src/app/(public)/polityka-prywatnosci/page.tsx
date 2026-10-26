import type { Metadata } from "next";
import { privacy } from "@/features/legal/documents";
import { LegalDocumentPage } from "@/features/legal/legal-document-page";

export const metadata: Metadata = { title: privacy.title };

export default function PrivacyPage() {
	return <LegalDocumentPage document={privacy} version={privacy.versions[0]} />;
}
