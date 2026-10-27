import { BedDouble, House, Layers, MapPin, Scaling } from "lucide-react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { FavoriteButton } from "@/features/favorites/favorite-button";
import type { Property } from "@/features/properties/api";
import { cn } from "@/lib/utils";

const priceFormat = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });

function fullAddress(property: Property): string {
	return [property.street, property.district, property.city, property.province].filter(Boolean).join(", ");
}

export function PropertyCard({ property, className }: { property: Property; className?: string }) {
	const location = fullAddress(property);

	return (
		<a
			href={property.sourceUrl}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				"flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-slate",
				className,
			)}
		>
			<div className="relative aspect-[4/3] overflow-hidden bg-mist">
				{property.mainImageUrl ? (
					// Photos come from many portals, so their hosts can't be listed in next.config.ts.
					<Image className="object-cover" src={property.mainImageUrl} alt={property.title} fill unoptimized />
				) : (
					<div className="grid h-full place-items-center text-line">
						<Icon icon={House} className="text-[64px]" />
					</div>
				)}
				<span className="head absolute right-0 bottom-0 bg-ink px-4 py-2 text-[15px] text-white">
					{property.price === null ? "Zapytaj o cenę" : priceFormat.format(property.price)}
				</span>
			</div>
			<div className="px-5 pt-5 pb-3">
				<h4 className="truncate text-[17px] font-medium" title={property.title}>
					{property.title}
				</h4>
				<div className="flex h-5 items-center gap-1 text-[13px]">
					{location && (
						<>
							<Icon icon={MapPin} className="text-[16px] text-muted" />
							<span className="truncate" title={location}>
								{location}
							</span>
						</>
					)}
				</div>
				<p className="mt-1.5 text-[12px] text-body">
					<TimeAgo label="Dodano" date={property.firstSeenAt} />
				</p>
			</div>
			<div className="mt-auto flex h-11 items-center gap-6 border-t border-line px-5 text-[13px]">
				{property.areaM2 !== null && (
					<span className="flex items-center gap-1">
						<Icon icon={Scaling} className="text-[18px]" />
						{property.areaM2} m²
					</span>
				)}
				{property.rooms !== null && (
					<span className="flex items-center gap-1">
						<Icon icon={BedDouble} className="text-[18px]" />
						{property.rooms} pok.
					</span>
				)}
			</div>
		</a>
	);
}

const NEW_FOR_MS = 24 * 60 * 60 * 1000;

function isNew(property: Property): boolean {
	return Date.now() - new Date(property.firstSeenAt).getTime() < NEW_FOR_MS;
}

const areaFormat = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 });
const relativeFormat = new Intl.RelativeTimeFormat("pl", { numeric: "always" });
const dateFormat = new Intl.DateTimeFormat("pl-PL", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "Europe/Warsaw",
});

const timeUnits: [Intl.RelativeTimeFormatUnit, number][] = [
	["day", 24 * 60 * 60],
	["hour", 60 * 60],
	["minute", 60],
];

/** E.g. "10 minut temu", "5 godzin temu", "45 dni temu". */
function timeAgo(date: string): string {
	const seconds = (new Date(date).getTime() - Date.now()) / 1000;
	for (const [unit, size] of timeUnits) {
		if (Math.abs(seconds) >= size) {
			return relativeFormat.format(Math.trunc(seconds / size), unit);
		}
	}
	return "przed chwilą";
}

function wasUpdated(property: Property): boolean {
	return new Date(property.updatedAt).getTime() - new Date(property.firstSeenAt).getTime() >= 60 * 1000;
}

function TimeAgo({ label, date }: { label: string; date: string }) {
	return (
		<time dateTime={date} title={dateFormat.format(new Date(date))}>
			{label} {timeAgo(date)}
		</time>
	);
}

const sellerLabels: Record<NonNullable<Property["sellerType"]>, string> = {
	private: "Oferta prywatna",
	agency: "Biuro nieruchomości",
	developer: "Deweloper",
};

function roomsText(rooms: number): string {
	const lastDigit = rooms % 10;
	const lastTwo = rooms % 100;
	if (rooms === 1) {
		return "1 pokój";
	}
	return `${rooms} ${lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? "pokoje" : "pokoi"}`;
}

/** The scraper sends a number, ">10", or a word such as "parter" or "poddasze". */
function floorText(floor: string): string {
	if (/^\d+$/.test(floor)) {
		return `${floor} piętro`;
	}
	return floor.startsWith(">") ? `powyżej ${floor.slice(1)} piętra` : floor;
}

export function PropertyListItem({ property, favorite }: { property: Property; favorite?: boolean }) {
	const address = fullAddress(property);
	const badge = property.archivedAt ? "Archiwalna" : isNew(property) ? "Nowość" : null;

	return (
		<article className="relative flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-slate sm:flex-row">
			<div className="relative aspect-[4/3] shrink-0 bg-mist sm:w-[340px]">
				{property.mainImageUrl ? (
					<Image className="object-cover" src={property.mainImageUrl} alt={property.title} fill unoptimized />
				) : (
					<div className="grid h-full place-items-center text-line">
						<Icon icon={House} className="text-[64px]" />
					</div>
				)}
				{badge && (
					<span
						className={cn(
							"head absolute top-3 left-3 rounded px-2 py-1 text-[10px] font-bold tracking-wider uppercase",
							property.archivedAt ? "bg-white text-ink" : "bg-pastel-violet text-slate",
						)}
					>
						{badge}
					</span>
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col px-6 pt-5">
				<div className="flex items-start justify-between gap-3">
					<p className="flex flex-wrap items-baseline gap-x-2.5">
						<span className="head text-[26px] font-bold">
							{property.price === null ? "Zapytaj o cenę" : priceFormat.format(property.price)}
						</span>
						{property.pricePerM2 !== null && (
							<span className="text-[13px] text-muted">{priceFormat.format(property.pricePerM2)}/m²</span>
						)}
					</p>
					<span className="head mt-1.5 shrink-0 rounded border border-line bg-mist px-2 py-0.5 text-[12px] font-semibold">
						{property.sourcePortal}
					</span>
				</div>
				<h3 className="mt-1.5 line-clamp-2 text-[18px] leading-snug font-medium" title={property.title}>
					<a
						href={property.sourceUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="after:absolute after:inset-0"
					>
						{property.title}
					</a>
				</h3>
				{address && <p className="mt-2 truncate text-[14px]">{address}</p>}
				<div className="head mt-4 flex flex-wrap gap-x-7 gap-y-1 text-[15px] font-semibold">
					{property.rooms !== null && (
						<span className="flex items-center gap-1.5">
							<Icon icon={BedDouble} className="text-[20px] text-muted" />
							{roomsText(property.rooms)}
						</span>
					)}
					{property.areaM2 !== null && (
						<span className="flex items-center gap-1.5">
							<Icon icon={Scaling} className="text-[20px] text-muted" />
							{areaFormat.format(property.areaM2)} m²
						</span>
					)}
					{property.floor && (
						<span className="flex items-center gap-1.5">
							<Icon icon={Layers} className="text-[20px] text-muted" />
							{floorText(property.floor)}
						</span>
					)}
				</div>
				<div className="mt-auto flex items-center justify-between gap-3 border-t border-line py-3 text-[13px] text-muted">
					<div>
						{property.sellerType && <p>{sellerLabels[property.sellerType]}</p>}
						<p className="flex flex-wrap gap-x-4 text-body">
							<TimeAgo label="Dodano" date={property.firstSeenAt} />
							{property.archivedAt ? (
								<TimeAgo label="Wygasło" date={property.archivedAt} />
							) : (
								wasUpdated(property) && <TimeAgo label="Zaktualizowano" date={property.updatedAt} />
							)}
						</p>
					</div>
					{favorite !== undefined && (
						<FavoriteButton
							propertyId={property.id}
							initialFavorite={favorite}
							className="z-10 -mr-2 shrink-0"
						/>
					)}
				</div>
			</div>
		</article>
	);
}

export function PropertyListSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className="grid gap-4" aria-hidden="true">
			{Array.from({ length: count }, (_, index) => (
				<div key={index} className="h-[257px] animate-pulse rounded-xl bg-white" />
			))}
		</div>
	);
}

export function PropertyGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
	return (
		<div className={cn("grid gap-7 sm:grid-cols-2 lg:grid-cols-3", className)} aria-hidden="true">
			{Array.from({ length: count }, (_, index) => (
				<div key={index} className="h-[347px] animate-pulse rounded-xl bg-white" />
			))}
		</div>
	);
}
