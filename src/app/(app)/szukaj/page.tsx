import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { searchProperties, type PagedProperties } from "@/features/properties/api";
import { FiltersPanel } from "@/features/properties/filters-panel";
import { FiltersForm } from "@/features/properties/search-form";
import {
	isDefaultFilter,
	parseSearchFilters,
	toApiQuery,
	toSearchParams,
	type SearchFilters,
} from "@/features/properties/search-params";
import { loadFavoriteIds, loadLocation, ResultsSkeleton, SearchResults } from "@/features/properties/search-results";
import { ApiError } from "@/lib/api/errors";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Wyszukiwarka", robots: { index: false } };

type SearchPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default function SearchPage({ searchParams }: SearchPageProps) {
	return (
		<main>
			<div className="mx-auto max-w-[1360px] px-3 py-10 sm:px-6">
				<Suspense fallback={<SearchLayout aside={<FiltersSkeleton />} />}>
					<SearchView searchParams={searchParams} />
				</Suspense>
			</div>
		</main>
	);
}

async function SearchView({ searchParams }: SearchPageProps) {
	const filters = parseSearchFilters(await searchParams);
	const query = toSearchParams(filters).toString();

	return (
		<SearchLayout
			aside={
				<Suspense fallback={<FiltersSkeleton />}>
					<Filters filters={filters} query={query} />
				</Suspense>
			}
		>
			<Suspense key={query} fallback={<ResultsSkeleton />}>
				<Results filters={filters} />
			</Suspense>
		</SearchLayout>
	);
}

/** Apart from the results, so loading the picked location does not hold up the search. */
async function Filters({ filters, query }: { filters: SearchFilters; query: string }) {
	const location = await loadLocation(filters);
	const activeCount =
		Object.entries(filters).filter(
			([key, value]) =>
				!["sort", "page", "locationId", "district", "radius"].includes(key) &&
				value !== undefined &&
				!isDefaultFilter(key, value),
		).length + (filters.locationId ? 1 : 0);

	return (
		// Keyed by the query, so the uncontrolled fields reset after navigating, e.g. "Wyczyść".
		<FiltersPanel key={query} activeCount={activeCount}>
			<FiltersForm filters={filters} location={location} />
		</FiltersPanel>
	);
}

function FiltersSkeleton() {
	return <div className="h-11 animate-pulse rounded-[7px] bg-white lg:h-[640px] lg:rounded-xl" />;
}

function SearchLayout({ aside, children }: { aside: React.ReactNode; children?: React.ReactNode }) {
	return (
		<div className="grid items-start gap-5 lg:grid-cols-[1fr_380px] lg:gap-3">
			{/* Scrolls on its own when taller than the screen; a sticky element would otherwise hide its bottom. */}
			<aside className="lg:sticky lg:top-[100px] lg:order-last lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
				{aside}
			</aside>
			<section className="min-w-0">{children ?? <ResultsSkeleton />}</section>
		</div>
	);
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

	return (
		<SearchResults
			path={routes.search}
			filters={filters}
			result={result}
			failure={failure}
			favoriteIds={favoriteIds}
			emptyText="Brak ofert spełniających kryteria. Spróbuj poluzować filtry."
		/>
	);
}
