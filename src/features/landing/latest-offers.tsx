import { io } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/icon";
import { getLatestProperties, type Property } from "@/features/properties/api";
import { routes } from "@/lib/routes";

const priceFormat = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });

async function loadLatest(): Promise<Property[] | null> {
	try {
		return await getLatestProperties();
	} catch (error) {
		console.error("Failed to load the latest properties", error);
		return null;
	}
}

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
				<Suspense fallback={<OffersSkeleton />}>
					<OfferList />
				</Suspense>
			</div>
		</section>
	);
}

async function OfferList() {
	// io() keeps the API call out of the build, so the page builds without the backend running.
	await io();
	const offers = await loadLatest();

	if (!offers || offers.length === 0) {
		return (
			<p className="mt-10 rounded-xl bg-white p-8 text-center">
				{offers ? "Nie ma jeszcze żadnych ofert." : "Nie udało się pobrać ofert. Spróbuj ponownie za chwilę."}
			</p>
		);
	}

	return (
		<div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
			{offers.map((offer) => (
				<OfferCard key={offer.id} offer={offer} />
			))}
		</div>
	);
}

function OffersSkeleton() {
	return (
		<div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
			{Array.from({ length: 6 }, (_, index) => (
				<div key={index} className="h-[330px] animate-pulse rounded-xl bg-white" />
			))}
		</div>
	);
}

function OfferCard({ offer }: { offer: Property }) {
	const location = [offer.district, offer.city].filter(Boolean).join(", ");

	return (
		<a
			href={offer.sourceUrl}
			target="_blank"
			rel="noopener noreferrer"
			className="reveal flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-slate"
		>
			<div className="relative aspect-[4/3] overflow-hidden bg-mist">
				{offer.mainImageUrl ? (
					// Photos come from many portals, so their hosts can't be listed in next.config.ts.
					<Image className="object-cover" src={offer.mainImageUrl} alt={offer.title} fill unoptimized />
				) : (
					<div className="grid h-full place-items-center text-line">
						<Icon name="home" className="text-[64px]" />
					</div>
				)}
				<span className="head absolute right-0 bottom-0 bg-ink px-4 py-2 text-[15px] text-white">
					{offer.price === null ? "Zapytaj o cenę" : priceFormat.format(offer.price)}
				</span>
			</div>
			<div className="p-5">
				<h4 className="truncate text-[17px] font-medium" title={offer.title}>
					{offer.title}
				</h4>
				<div className="flex h-5 items-center gap-1 text-[13px]">
					{location && (
						<>
							<Icon name="location_on" className="text-[16px] text-muted" />
							<span className="truncate">{location}</span>
						</>
					)}
				</div>
			</div>
			<div className="mt-auto flex h-11 items-center gap-6 border-t border-line px-5 text-[13px]">
				{offer.areaM2 !== null && (
					<span className="flex items-center gap-1">
						<Icon name="square_foot" className="text-[18px]" />
						{offer.areaM2} m²
					</span>
				)}
				{offer.rooms !== null && (
					<span className="flex items-center gap-1">
						<Icon name="bed" className="text-[18px]" />
						{offer.rooms} pok.
					</span>
				)}
			</div>
		</a>
	);
}
