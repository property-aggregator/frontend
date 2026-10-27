import type { Metadata } from "next";
import heroPhoto from "@/assets/properties/hero.webp";
import { BackgroundPhoto } from "@/components/background-photo";
import { FiltersPanel } from "@/features/properties/filters-panel";
import { LatestProperties } from "@/features/properties/latest-properties";
import { HeroSearchForm } from "@/features/properties/search-form";

export const metadata: Metadata = { title: "Oferty", robots: { index: false } };

export default function PropertiesHomePage() {
	return (
		<main>
			<section className="relative bg-ink py-16">
				<BackgroundPhoto src={heroPhoto} darkness={0.9} priority />
				<div className="relative mx-auto max-w-[1360px] px-6">
					<h1 className="title text-white">Znajdź swoją nieruchomość</h1>
					<p className="mt-3 text-white/70">Przeszukaj oferty z ponad 300 portali naraz.</p>
					<div className="mt-8">
						<FiltersPanel variant="bare" button="search">
							<HeroSearchForm />
						</FiltersPanel>
					</div>
				</div>
			</section>
			<section className="py-14">
				<div className="mx-auto max-w-[1360px] px-6">
					<h2 className="title text-[28px]">Najnowsze oferty</h2>
					<LatestProperties className="mt-8" />
				</div>
			</section>
		</main>
	);
}
