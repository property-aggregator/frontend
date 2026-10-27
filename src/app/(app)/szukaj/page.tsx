import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/icon";
import { getFavoriteIds } from "@/features/favorites/api";
import { searchProperties, type PagedProperties } from "@/features/properties/api";
import { PropertyListItem, PropertyListSkeleton } from "@/features/properties/property-card";
import { FiltersPanel } from "@/features/properties/filters-panel";
import { FiltersForm, SortSelect } from "@/features/properties/search-form";
import {
	parseSearchFilters,
	toApiQuery,
	toSearchParams,
	type SearchFilters,
} from "@/features/properties/search-params";
import { ApiError } from "@/lib/api/errors";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Wyszukiwarka", robots: { index: false } };

type SearchPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default function SearchPage({ searchParams }: SearchPageProps) {
	return (
		<main>
			<div className="mx-auto max-w-[1360px] px-6 py-10">
				<Suspense
					fallback={
						<SearchLayout
							aside={
								<div className="h-11 animate-pulse rounded-full bg-white lg:h-[640px] lg:rounded-xl" />
							}
						/>
					}
				>
					<SearchView searchParams={searchParams} />
				</Suspense>
			</div>
		</main>
	);
}

async function SearchView({ searchParams }: SearchPageProps) {
	const filters = parseSearchFilters(await searchParams);
	const query = toSearchParams(filters).toString();
	const activeCount = Object.entries(filters).filter(
		([key, value]) => key !== "sort" && key !== "page" && value !== undefined,
	).length;

	return (
		<SearchLayout
			aside={
				// Keyed by the query, so the uncontrolled fields reset after navigating, e.g. "Wyczyść".
				<FiltersPanel key={query} activeCount={activeCount}>
					<FiltersForm filters={filters} />
				</FiltersPanel>
			}
		>
			<Suspense key={query} fallback={<ResultsSkeleton />}>
				<Results filters={filters} />
			</Suspense>
		</SearchLayout>
	);
}

function SearchLayout({ aside, children }: { aside: React.ReactNode; children?: React.ReactNode }) {
	return (
		<div className="grid items-start gap-5 lg:grid-cols-[1fr_360px] lg:gap-8">
			{/* Scrolls on its own when taller than the screen; a sticky element would otherwise hide its bottom. */}
			<aside className="lg:sticky lg:top-[100px] lg:order-last lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
				{aside}
			</aside>
			<section className="min-w-0">{children ?? <ResultsSkeleton />}</section>
		</div>
	);
}

function ResultsSkeleton() {
	return (
		<>
			<div className="mb-6 h-9 w-64 animate-pulse rounded-lg bg-white" />
			<PropertyListSkeleton />
		</>
	);
}

async function loadFavoriteIds(): Promise<Set<string> | null> {
	try {
		return await getFavoriteIds();
	} catch (error) {
		unstable_rethrow(error);
		console.error("Failed to load the favorite ids", error);
		return null;
	}
}

async function search(filters: SearchFilters): Promise<{ result: PagedProperties | null; failure: string | null }> {
	try {
		return { result: await searchProperties(toApiQuery(filters)), failure: null };
	} catch (error) {
		unstable_rethrow(error);
		if (error instanceof ApiError && error.status === 400) {
			return { result: null, failure: "Sprawdź filtry – np. wartość „do” nie może być mniejsza niż „od”." };
		}
		console.error("Failed to search properties", error);
		return { result: null, failure: "Nie udało się pobrać ofert. Spróbuj ponownie za chwilę." };
	}
}

async function Results({ filters }: { filters: SearchFilters }) {
	const [{ result, failure }, favoriteIds] = await Promise.all([search(filters), loadFavoriteIds()]);
	const totalCount = result?.totalCount ?? 0;

	return (
		<>
			<div className="mb-4 flex items-start justify-between gap-3 lg:mb-6 lg:items-center">
				<div>
					<h1 className="title text-[18px] lg:text-[24px]">
						<span className="lg:hidden">{mobileHeading(result)}</span>
						<span className="hidden lg:inline">
							Znaleziono {totalCount.toLocaleString("pl-PL")} {offersWord(totalCount)}
						</span>
					</h1>
					{result && result.items.length > 0 && (
						<div className="hidden lg:block">
							<RangeInfo result={result} />
						</div>
					)}
				</div>
				<SortSelect filters={filters} />
			</div>
			{!result ? (
				<Notice>{failure}</Notice>
			) : result.items.length === 0 ? (
				<p className="rounded-xl bg-white p-8 text-center">
					{result.totalCount > 0 ? (
						<>
							Ta strona wyników nie istnieje.{" "}
							<Link href={pageHref(filters, 1)} className="font-semibold text-ink underline">
								Wróć na pierwszą stronę
							</Link>
						</>
					) : (
						"Brak ofert spełniających kryteria. Spróbuj poluzować filtry."
					)}
				</p>
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
			{result && <Pagination filters={filters} page={result.page} totalPages={result.totalPages} />}
		</>
	);
}

function Pagination({ filters, page, totalPages }: { filters: SearchFilters; page: number; totalPages: number }) {
	if (totalPages <= 1) {
		return null;
	}

	return (
		<nav className="mt-12 flex items-center justify-center gap-2" aria-label="Strony wyników">
			<PageLink filters={filters} page={page - 1} disabled={page <= 1} label="Poprzednia strona">
				<Icon icon={ChevronLeft} className="text-[20px]" />
			</PageLink>
			{pageNumbers(page, totalPages).map((number, index) =>
				number === null ? (
					<span key={`gap-${index}`} className="px-1 text-muted">
						…
					</span>
				) : (
					<PageLink key={number} filters={filters} page={number} current={number === page}>
						{number}
					</PageLink>
				),
			)}
			<PageLink filters={filters} page={page + 1} disabled={page >= totalPages} label="Następna strona">
				<Icon icon={ChevronRight} className="text-[20px]" />
			</PageLink>
		</nav>
	);
}

type PageLinkProps = {
	filters: SearchFilters;
	page: number;
	current?: boolean;
	disabled?: boolean;
	label?: string;
	children: React.ReactNode;
};

function PageLink({ filters, page, current, disabled, label, children }: PageLinkProps) {
	const className = cn(
		"head grid h-10 min-w-10 place-items-center rounded-md border px-2 text-[14px] font-semibold",
		current ? "border-slate bg-slate text-white" : "border-line bg-white hover:border-ink",
		disabled && "pointer-events-none opacity-40",
	);

	if (disabled) {
		return (
			<span className={className} aria-label={label} aria-disabled="true">
				{children}
			</span>
		);
	}

	return (
		<Link
			href={pageHref(filters, page)}
			className={className}
			aria-label={label}
			aria-current={current ? "page" : undefined}
		>
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
		<p className="mt-1 text-[13px] text-muted">
			{from.toLocaleString("pl-PL")}–{to.toLocaleString("pl-PL")} z {result.totalCount.toLocaleString("pl-PL")}{" "}
			{result.totalCount === 1 ? "ogłoszenia" : "ogłoszeń"}
		</p>
	);
}

function Notice({ children }: { children: React.ReactNode }) {
	return <p className="rounded-xl bg-white p-8 text-center">{children}</p>;
}

/** First, last and the neighbours of the current page; null marks a gap. */
function pageNumbers(page: number, totalPages: number): (number | null)[] {
	const shown = [...new Set([1, page - 1, page, page + 1, totalPages])]
		.filter((number) => number >= 1 && number <= totalPages)
		.sort((a, b) => a - b);

	return shown.flatMap((number, index) => (index > 0 && number - shown[index - 1] > 1 ? [null, number] : [number]));
}

function pageHref(filters: SearchFilters, page: number): string {
	const params = toSearchParams({ ...filters, page: page > 1 ? page : undefined });
	return `${routes.search}?${params}`;
}

function offersWord(count: number): string {
	if (count === 1) {
		return "ofertę";
	}
	const lastDigit = count % 10;
	const lastTwo = count % 100;
	return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? "oferty" : "ofert";
}
