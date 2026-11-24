import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/features/account/api";
import { searchDeals, type PagedProperties } from "@/features/properties/api";
import { FiltersPanel } from "@/features/properties/filters-panel";
import { DealsFiltersForm } from "@/features/properties/search-form";
import {
	parseDealFilters,
	toDealsApiQuery,
	toSearchParams,
	type DealFilters,
} from "@/features/properties/search-params";
import {
	loadFavoriteIds,
	loadLocation,
	Notice,
	ResultsSkeleton,
	SearchResults,
} from "@/features/properties/search-results";
import { ApiError } from "@/lib/api/errors";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Okazje", robots: { index: false } };

type DealsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default function DealsPage({ searchParams }: DealsPageProps) {
	return (
		<main>
			<div className="mx-auto max-w-[1360px] px-3 py-10 sm:px-6">
				{/* Not a heading: the results count is the page's h1. */}
				<p className="title mb-4 text-2xl lg:hidden">Potencjalne okazje</p>
				<Suspense fallback={<DealsLayout aside={<FiltersSkeleton />} />}>
					<DealsView searchParams={searchParams} />
				</Suspense>
			</div>
		</main>
	);
}

async function DealsView({ searchParams }: DealsPageProps) {
	const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
	if (!user.entitlements.deals) {
		return <Notice>{notInPlan}</Notice>;
	}

	const filters = parseDealFilters(params);
	const query = toSearchParams(filters).toString();

	return (
		<DealsLayout
			aside={
				<Suspense fallback={<FiltersSkeleton />}>
					<Filters filters={filters} query={query} />
				</Suspense>
			}
		>
			<Suspense key={query} fallback={<ResultsSkeleton />}>
				<Results filters={filters} />
			</Suspense>
		</DealsLayout>
	);
}

function DealsLayout({ aside, children }: { aside: React.ReactNode; children?: React.ReactNode }) {
	return (
		<div className="grid items-start gap-5 lg:grid-cols-[1fr_380px] lg:gap-3">
			<aside className="lg:sticky lg:top-[100px] lg:order-last">{aside}</aside>
			<section className="min-w-0">{children ?? <ResultsSkeleton />}</section>
		</div>
	);
}

/** Apart from the results, so loading the picked location does not hold up the search. */
async function Filters({ filters, query }: { filters: DealFilters; query: string }) {
	const location = await loadLocation(filters);
	const activeCount = [filters.locationId, filters.transaction, filters.type].filter(Boolean).length;

	return (
		// Keyed by the query, so the uncontrolled fields reset after navigating, e.g. "Wyczyść".
		<FiltersPanel key={query} activeCount={activeCount}>
			<DealsFiltersForm filters={filters} location={location} />
		</FiltersPanel>
	);
}

function FiltersSkeleton() {
	return <div className="h-11 animate-pulse rounded-[7px] bg-mist lg:h-[240px] lg:rounded-lg" />;
}

const notInPlan = (
	<>
		Okazje nie są dostępne w Twoim planie.{" "}
		<Link href={routes.premium} className="font-semibold text-ink hover:text-primary">
			Zobacz plany Premium
		</Link>
	</>
);

async function search(filters: DealFilters): Promise<{ result: PagedProperties | null; failure: React.ReactNode }> {
	try {
		return { result: await searchDeals(toDealsApiQuery(filters)), failure: null };
	} catch (error) {
		unstable_rethrow(error);
		if (error instanceof ApiError && error.code === "deals_not_in_plan") {
			return { result: null, failure: notInPlan };
		}
		console.error("Failed to load the deals", error);
		return { result: null, failure: "Nie udało się pobrać okazji. Spróbuj ponownie za chwilę." };
	}
}

async function Results({ filters }: { filters: DealFilters }) {
	const [{ result, failure }, favoriteIds] = await Promise.all([search(filters), loadFavoriteIds()]);

	return (
		<SearchResults
			path={routes.deals}
			filters={filters}
			result={result}
			failure={failure}
			favoriteIds={favoriteIds}
			emptyText="Brak okazji spełniających kryteria. Spróbuj zmienić lokalizację lub filtry."
			countWord={dealsWord}
		/>
	);
}

function dealsWord(count: number): string {
	if (count === 1) {
		return "potencjalną okazję";
	}
	const lastDigit = count % 10;
	const lastTwo = count % 100;
	return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)
		? "potencjalne okazje"
		: "potencjalnych okazji";
}
