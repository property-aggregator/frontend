import "maplibre-gl/dist/maplibre-gl.css";
import {
	BedDouble,
	Building2,
	ChevronLeft,
	House,
	Layers,
	type LucideIcon,
	MapPin,
	Scaling,
	SquareArrowOutUpRight,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { Carousel, CarouselSkeleton } from "@/components/carousel";
import { Icon } from "@/components/icon";
import { BackToSearchLink } from "@/components/navigation-history";
import { FavoriteButton } from "@/features/favorites/favorite-button";
import { getFavoriteIds } from "@/features/favorites/api";
import {
	getPriceHistory,
	getProperty,
	getPropertyDuplicates,
	getPropertyTransactions,
	getSimilarArchived,
	type Property,
} from "@/features/properties/api";
import {
	areaFormat,
	floorText,
	fullAddress,
	isNew,
	PriceChangeText,
	priceFormat,
	PropertyTile,
	roomsText,
	sellerLabels,
} from "@/features/properties/property-card";
import { PriceHistory } from "@/features/properties/price-history";
import { marketLabels } from "@/features/properties/search-params";
import { TransactionsMap } from "@/features/properties/transactions-map";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Oferta", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function PropertyPage({ params }: PageProps<"/oferty/[id]">) {
	return (
		<main>
			<div className="mx-auto max-w-[1360px] px-6 py-10">
				<BackToSearchLink className="head mb-6 inline-flex items-center gap-1 text-[14px] font-semibold hover:text-slate">
					<Icon icon={ChevronLeft} className="text-[18px]" />
					Wróć do wyszukiwarki
				</BackToSearchLink>
				<Suspense fallback={<DetailsSkeleton />}>
					{params.then(({ id }) => (
						<PropertyView id={id} />
					))}
				</Suspense>
			</div>
		</main>
	);
}

async function loadFavorite(id: string): Promise<boolean | undefined> {
	try {
		return (await getFavoriteIds()).has(id);
	} catch (error) {
		unstable_rethrow(error);
		console.error("Failed to load the favorite ids", error);
		return undefined;
	}
}

async function PropertyView({ id }: { id: string }) {
	if (!UUID.test(id)) {
		notFound();
	}

	const [property, favorite] = await Promise.all([getProperty(id), loadFavorite(id)]);
	if (!property) {
		notFound();
	}

	return (
		<>
			<Details property={property} favorite={favorite} />
			<Section title="Historia zmian ceny">
				<Suspense fallback={<BlockSkeleton height="h-[160px]" />}>
					<PriceHistorySection property={property} />
				</Suspense>
			</Section>
			{property.transactionType === "sale" && (
				<Section
					title="Transakcje z okolicy"
					subtitle="Ceny, za które faktycznie sprzedano podobne nieruchomości, dane z rejestru cen RCN."
				>
					<Suspense fallback={<BlockSkeleton height="h-[420px]" />}>
						<Transactions property={property} />
					</Suspense>
				</Section>
			)}
			<Section title="Potencjalne duplikaty">
				<Suspense fallback={<CarouselSkeleton height="h-[300px]" />}>
					<Duplicates property={property} />
				</Suspense>
			</Section>
			<Section title="Podobne z archiwum">
				<Suspense fallback={<CarouselSkeleton height="h-[300px]" />}>
					<SimilarArchived property={property} />
				</Suspense>
			</Section>
		</>
	);
}

function Details({ property, favorite }: { property: Property; favorite?: boolean }) {
	const address = fullAddress(property);
	const badge = property.archivedAt ? "Archiwalna" : isNew(property) ? "Nowość" : null;
	const facts: [string, string | null, LucideIcon][] = [
		["Powierzchnia", property.areaM2 === null ? null : `${areaFormat.format(property.areaM2)} m²`, Scaling],
		["Rynek", marketLabels[property.marketType], Building2],
		["Pokoje", property.rooms === null ? null : roomsText(property.rooms), BedDouble],
		["Piętro", property.floor && floorText(property.floor), Layers],
	];

	return (
		<div className="grid overflow-hidden rounded-xl bg-white md:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] xl:grid-cols-[480px_minmax(0,1fr)]">
			<div className="relative aspect-[4/3] bg-mist md:aspect-auto md:min-h-[280px]">
				{property.mainImageUrl ? (
					<Image
						className="object-cover"
						src={property.mainImageUrl}
						alt={property.title}
						fill
						unoptimized
						preload
					/>
				) : (
					<div className="grid h-full place-items-center text-line">
						<Icon icon={House} className="text-[120px]" />
					</div>
				)}
				{badge && (
					<span
						className={cn(
							"head absolute top-4 left-4 rounded px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase",
							property.archivedAt ? "bg-white text-ink" : "bg-pastel-violet text-slate",
						)}
					>
						{badge}
					</span>
				)}
			</div>
			<div className="flex flex-col p-6">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<p className="flex flex-wrap items-baseline gap-x-2.5">
						<span className="head text-[30px] font-bold">
							{property.price === null ? "Zapytaj o cenę" : priceFormat.format(property.price)}
						</span>
						{property.pricePerM2 !== null && (
							<span className="text-[14px] text-muted">{priceFormat.format(property.pricePerM2)}/m²</span>
						)}
						<PriceChangeText
							amount={property.priceChangeAmount}
							percent={property.priceChangePercent}
							className="text-[14px]"
						/>
					</p>
					<SourceLink property={property} className="shrink-0 max-md:hidden" />
				</div>
				<h1 className="mt-1 line-clamp-2 text-[19px] leading-snug font-semibold">{property.title}</h1>
				{address && (
					<p className="mt-1.5 flex items-start gap-1 text-[14px]">
						<Icon icon={MapPin} className="mt-0.5 text-[18px] text-muted" />
						{address}
					</p>
				)}
				<dl className="mt-5 grid grid-cols-[repeat(2,max-content)] gap-x-12 gap-y-3 border-t border-line pt-5 text-[14px]">
					{facts.map(
						([label, value, icon]) =>
							value && (
								<div key={label}>
									<dt className="text-[13px] text-muted">{label}</dt>
									<dd className="head flex items-center gap-1.5 font-semibold">
										<Icon icon={icon} className="text-[20px] text-muted" />
										{value}
									</dd>
								</div>
							),
					)}
				</dl>
				<div className="mt-auto flex min-h-11 items-end justify-between gap-3 pt-4">
					<p className="text-[13px] text-muted">{property.sellerType && sellerLabels[property.sellerType]}</p>
					{favorite !== undefined && (
						<FavoriteButton propertyId={property.id} initialFavorite={favorite} className="-mr-2 -mb-2" />
					)}
				</div>
				<SourceLink property={property} className="mt-5 self-center md:hidden" />
			</div>
		</div>
	);
}

function SourceLink({ property, className }: { property: Property; className?: string }) {
	return (
		<a
			href={property.sourceUrl}
			target="_blank"
			rel="noopener noreferrer"
			className={cn("btn btn-sm btn-slate", className)}
		>
			Przejdź do ogłoszenia
			<Icon icon={SquareArrowOutUpRight} className="text-[18px]" />
		</a>
	);
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
	return (
		<section className="mt-14">
			<h2 className={cn("title text-[24px]", !subtitle && "mb-5")}>{title}</h2>
			{subtitle && <p className="mt-1 mb-5 text-[14px] text-body">{subtitle}</p>}
			{children}
		</section>
	);
}

function Notice({ children }: { children: React.ReactNode }) {
	return <p className="rounded-xl bg-white p-8 text-center">{children}</p>;
}

function BlockSkeleton({ height }: { height: string }) {
	return <div className={cn("animate-pulse rounded-xl bg-white", height)} aria-hidden="true" />;
}

function DetailsSkeleton() {
	return <div className="h-[320px] animate-pulse rounded-xl bg-white" aria-hidden="true" />;
}

async function load<T>(fetcher: () => Promise<T>, what: string): Promise<T | null> {
	try {
		return await fetcher();
	} catch (error) {
		unstable_rethrow(error);
		console.error(`Failed to load the ${what}`, error);
		return null;
	}
}

async function PriceHistorySection({ property }: { property: Property }) {
	const changes = await load(() => getPriceHistory(property.id), "price history");
	if (!changes) {
		return <Notice>Nie udało się pobrać historii cen. Spróbuj ponownie za chwilę.</Notice>;
	}
	if (changes.length === 0) {
		return <Notice>Brak historii cen dla tej oferty.</Notice>;
	}

	return <PriceHistory changes={changes} lastSeenAt={property.lastSeenAt} />;
}

async function Transactions({ property }: { property: Property }) {
	const result = await load(() => getPropertyTransactions(property.id), "transactions");
	if (!result) {
		return <Notice>Nie udało się pobrać transakcji. Spróbuj ponownie za chwilę.</Notice>;
	}
	if (result.transactions.length === 0) {
		return <Notice>Brak podobnych transakcji w rejestrze cen.</Notice>;
	}

	return (
		<TransactionsMap
			transactions={result.transactions}
			latitude={property.latitude}
			longitude={property.longitude}
			showDistance={result.scope === "nearby"}
		/>
	);
}

async function Duplicates({ property }: { property: Property }) {
	const duplicates = await load(() => getPropertyDuplicates(property.id), "duplicates");
	if (!duplicates) {
		return <Notice>Nie udało się pobrać duplikatów. Spróbuj ponownie za chwilę.</Notice>;
	}
	if (duplicates.length === 0) {
		return <Notice>Nie znaleźliśmy tej nieruchomości w innych ogłoszeniach.</Notice>;
	}

	return (
		<Carousel label="Potencjalne duplikaty">
			{duplicates.map((duplicate) => (
				<PropertyTile key={duplicate.id} property={duplicate} showPortal />
			))}
		</Carousel>
	);
}

async function SimilarArchived({ property }: { property: Property }) {
	const similar = await load(() => getSimilarArchived(property.id), "similar archived properties");
	if (!similar) {
		return <Notice>Nie udało się pobrać ofert z archiwum. Spróbuj ponownie za chwilę.</Notice>;
	}
	if (similar.length === 0) {
		return <Notice>Brak podobnych ofert w archiwum.</Notice>;
	}

	return (
		<Carousel label="Podobne z archiwum">
			{similar.map((archived) => (
				<PropertyTile key={archived.id} property={archived} />
			))}
		</Carousel>
	);
}
