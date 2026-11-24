import type { Metadata } from "next";
import { FiltersPanel } from "@/features/properties/filters-panel";
import { LatestProperties } from "@/features/properties/latest-properties";
import { HeroSearchForm } from "@/features/properties/search-form";

export const metadata: Metadata = { title: "Oferty", robots: { index: false } };

export default function PropertiesHomePage() {
	return (
		<main>
			<section className="py-16">
				<div className="mx-auto max-w-[1360px] px-6">
					<h1 className="title">Znajdź swoją nieruchomość</h1>
					<p className="mt-3">Przeszukaj oferty z ponad 300 portali naraz.</p>
					<div className="mt-8">
						<FiltersPanel variant="bare" button="search">
							<HeroSearchForm />
						</FiltersPanel>
					</div>
				</div>
			</section>
			<section className="py-14">
				<div className="mx-auto max-w-[1360px] px-3 sm:px-6">
					<h2 className="title text-3xl">Najnowsze oferty</h2>
					<LatestProperties className="mt-8" signedIn />
				</div>
			</section>
		</main>
	);
}
