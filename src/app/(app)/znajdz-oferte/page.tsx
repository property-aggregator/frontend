import type { Metadata } from "next";
import { FindByUrlForm } from "@/features/properties/find-by-url-form";

export const metadata: Metadata = { title: "Znajdź ofertę po linku", robots: { index: false } };

export default function FindByUrlPage() {
	return (
		<main>
			<div className="mx-auto max-w-[1360px] px-6 py-10">
				<div className="rounded-xl bg-white p-8 md:p-10">
					<h1 className="title text-3xl">Znajdź ofertę po linku</h1>
					<p className="mt-3">
						Wklej link do ogłoszenia z dowolnego portalu, a pokażemy je razem z historią cen, transakcjami z
						okolicy i duplikatami.
					</p>
					<FindByUrlForm />
				</div>
			</div>
		</main>
	);
}
