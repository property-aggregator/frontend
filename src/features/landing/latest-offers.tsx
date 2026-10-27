import Link from "next/link";
import { LatestProperties } from "@/features/properties/latest-properties";
import { routes } from "@/lib/routes";

export function LatestOffers() {
	return (
		<section id="oferty" className="bg-mist py-20">
			<div className="mx-auto max-w-[1170px] px-6">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
					<h2 className="title">Najnowsze oferty</h2>
					<Link href={routes.properties} className="btn btn-soft self-start sm:self-auto">
						Wszystkie oferty
					</Link>
				</div>
				<LatestProperties className="mt-10" cardClassName="reveal" />
			</div>
		</section>
	);
}
