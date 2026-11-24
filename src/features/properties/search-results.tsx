import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Icon } from "@/components/icon";
import { getFavoriteIds } from "@/features/favorites/api";
import { cn } from "@/lib/utils";
import { getDistricts, getLocations, type LocationSuggestion, type PagedProperties } from "./api";
import { PropertyListItem, PropertyListSkeleton } from "./property-card";
import { SortSelect } from "./search-form";
import { toSearchParams, type SearchFilters } from "./search-params";

/** Filters as kept in the URL; a view may use only some of them. */
type UrlFilters = Partial<SearchFilters> & Pick<SearchFilters, "sort">;

/** The picked location with its districts; districts picked earlier stay listed even when no longer offered. */
export async function loadLocation({
	locationId,
	district = [],
}: Partial<SearchFilters>): Promise<LocationSuggestion | undefined> {
	if (!locationId) {
		return undefined;
	}

	try {
		const [found, districts] = await Promise.all([
			getLocations([locationId, ...district]),
			getDistricts(locationId),
		]);
		const location = found.find(({ id }) => id === locationId);
		if (!location) {
			return undefined;
		}
		const missing = found.filter(({ id }) => id !== locationId && !districts.some((offered) => offered.id === id));
		return { ...location, districts: [...districts, ...missing] };
	} catch (error) {
		unstable_rethrow(error);
		console.error("Failed to load the search location", error);
		return undefined;
	}
}

export async function loadFavoriteIds(): Promise<Set<string> | null> {
	try {
		return await getFavoriteIds();
	} catch (error) {
		unstable_rethrow(error);
		console.error("Failed to load the favorite ids", error);
		return null;
	}
}

export function ResultsSkeleton() {
	return (
		<>
			<div className="mb-6 h-9 w-64 animate-pulse rounded-lg bg-mist" />
			<PropertyListSkeleton />
		</>
	);
}

type SearchResultsProps = {
	path: string;
	filters: UrlFilters;
	result: PagedProperties | null;
	failure: React.ReactNode;
	favoriteIds: Set<string> | null;
	emptyText: string;
	/** What was found, inflected for the count after "Znaleziono". */
	countWord?: (count: number) => string;
};

export function SearchResults({
	path,
	filters,
	result,
	failure,
	favoriteIds,
	emptyText,
	countWord = offersWord,
}: SearchResultsProps) {
	const totalCount = result?.totalCount ?? 0;

	return (
		<>
			<div className="mb-4 flex items-start justify-between gap-3 lg:mb-6 lg:items-center">
				<div>
					<h1 className="title text-xl lg:text-2xl">
						<span className="text-md font-normal text-body lg:hidden">{mobileHeading(result)}</span>
						<span className="hidden lg:inline">
							Znaleziono {totalCount.toLocaleString("pl-PL")} {countWord(totalCount)}
						</span>
					</h1>
					{result && result.items.length > 0 && (
						<div className="hidden lg:block">
							<RangeInfo result={result} />
						</div>
					)}
				</div>
				<SortSelect path={path} filters={filters} />
			</div>
			{!result ? (
				<Notice>{failure}</Notice>
			) : result.items.length === 0 ? (
				<Notice>
					{result.totalCount > 0 ? (
						<>
							Ta strona wyników nie istnieje.{" "}
							<Link
								href={pageHref(path, filters, 1)}
								className="font-semibold text-ink hover:text-primary"
							>
								Wróć na pierwszą stronę
							</Link>
						</>
					) : (
						emptyText
					)}
				</Notice>
			) : (
				<div className="grid gap-4">
					{result.items.map((property) => (
						<PropertyListItem
							key={property.id}
							property={property}
							favorite={favoriteIds?.has(property.id)}
						/>
					))}
				</div>
			)}
			{result && (
				<Pagination
					path={path}
					filters={filters}
					page={result.page}
					totalPages={result.totalPages ?? Math.ceil(result.totalCount / result.pageSize)}
				/>
			)}
		</>
	);
}

export function Notice({ children }: { children: React.ReactNode }) {
	return <p className="rounded-lg border border-line bg-white p-8 text-center">{children}</p>;
}

type PaginationProps = { path: string; filters: UrlFilters; page: number; totalPages: number };

function Pagination({ path, filters, page, totalPages }: PaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	return (
		<nav className="mt-12 flex items-center justify-center gap-2" aria-label="Strony wyników">
			<PageLink href={pageHref(path, filters, page - 1)} disabled={page <= 1} label="Poprzednia strona">
				<Icon icon={ChevronLeft} className="text-2xl" />
			</PageLink>
			{pageNumbers(page, totalPages).map((number, index) =>
				number === null ? (
					<span key={`gap-${index}`} className="px-1 text-muted">
						…
					</span>
				) : (
					<PageLink key={number} href={pageHref(path, filters, number)} current={number === page}>
						{number}
					</PageLink>
				),
			)}
			<PageLink href={pageHref(path, filters, page + 1)} disabled={page >= totalPages} label="Następna strona">
				<Icon icon={ChevronRight} className="text-2xl" />
			</PageLink>
		</nav>
	);
}

type PageLinkProps = {
	href: string;
	current?: boolean;
	disabled?: boolean;
	label?: string;
	children: React.ReactNode;
};

function PageLink({ href, current, disabled, label, children }: PageLinkProps) {
	const className = cn(
		"head grid h-10 min-w-10 place-items-center rounded-md px-2 text-base font-semibold",
		current ? "bg-primary text-white" : "border border-line bg-white",
		disabled ? "cursor-not-allowed opacity-40" : !current && "hover:bg-line",
	);

	if (disabled) {
		return (
			<span className={className} aria-label={label} aria-disabled="true">
				{children}
			</span>
		);
	}

	return (
		<Link href={href} className={className} aria-label={label} aria-current={current ? "page" : undefined}>
			{children}
		</Link>
	);
}

function pageRange(result: PagedProperties) {
	const from = (result.page - 1) * result.pageSize + 1;
	return { from, to: from + result.items.length - 1 };
}

/** E.g. "1–20 ogłoszeń z 1 534", as on Otodom. */
function mobileHeading(result: PagedProperties | null): string {
	if (!result || result.items.length === 0) {
		return "0 ogłoszeń";
	}
	const { from, to } = pageRange(result);
	return `${from.toLocaleString("pl-PL")}–${to.toLocaleString("pl-PL")} ogłoszeń z ${result.totalCount.toLocaleString("pl-PL")}`;
}

function RangeInfo({ result }: { result: PagedProperties }) {
	const { from, to } = pageRange(result);

	return (
		<p className="mt-1 text-sm text-muted">
			{from.toLocaleString("pl-PL")}–{to.toLocaleString("pl-PL")} z {result.totalCount.toLocaleString("pl-PL")}{" "}
			{result.totalCount === 1 ? "ogłoszenia" : "ogłoszeń"}
		</p>
	);
}

/** First, last and the neighbours of the current page; null marks a gap. */
function pageNumbers(page: number, totalPages: number): (number | null)[] {
	const shown = [...new Set([1, page - 1, page, page + 1, totalPages])]
		.filter((number) => number >= 1 && number <= totalPages)
		.sort((a, b) => a - b);

	return shown.flatMap((number, index) => (index > 0 && number - shown[index - 1] > 1 ? [null, number] : [number]));
}

function pageHref(path: string, filters: UrlFilters, page: number): string {
	const params = toSearchParams({ ...filters, page: page > 1 ? page : undefined });
	return `${path}?${params}`;
}

function offersWord(count: number): string {
	if (count === 1) {
		return "ofertę";
	}
	const lastDigit = count % 10;
	const lastTwo = count % 100;
	return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? "oferty" : "ofert";
}
