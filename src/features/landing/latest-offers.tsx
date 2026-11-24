import { LatestProperties } from "@/features/properties/latest-properties";

export function LatestOffers() {
	return (
		<section id="oferty" className="py-20">
			<div className="mx-auto max-w-[1170px] px-6">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
					<h2 className="title w-full text-center">Najnowsze oferty</h2>
				</div>
				<LatestProperties className="reveal mt-10" />
			</div>
		</section>
	);
}
