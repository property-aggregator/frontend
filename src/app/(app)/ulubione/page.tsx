import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/features/account/api";
import { getFavorites } from "@/features/favorites/api";
import type { Property } from "@/features/properties/api";
import { PropertyListItem, PropertyListSkeleton } from "@/features/properties/property-card";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Ulubione", robots: { index: false } };

export default function FavoritesPage() {
	return (
		<main>
			<div className="mx-auto max-w-[1000px] px-6 py-10">
				<Suspense
					fallback={
						<>
							<div className="mb-6 h-9 w-64 animate-pulse rounded-lg bg-white" />
							<PropertyListSkeleton count={3} />
						</>
					}
				>
					<Favorites />
				</Suspense>
			</div>
		</main>
	);
}

async function loadFavorites(): Promise<Property[] | null> {
	try {
		return await getFavorites();
	} catch (error) {
		unstable_rethrow(error);
		console.error("Failed to load the favorites", error);
		return null;
	}
}

async function Favorites() {
	const [favorites, user] = await Promise.all([loadFavorites(), getCurrentUser()]);

	return (
		<>
			<div className="mb-4 lg:mb-6">
				<h1 className="title text-[24px] lg:text-[28px]">Ulubione oferty</h1>
				{favorites && (
					<p className="mt-1 text-[13px] text-muted">
						Zapisano {favorites.length} z {user.favoritesLimit} możliwych
					</p>
				)}
			</div>
			{!favorites ? (
				<p className="rounded-xl bg-white p-8 text-center">
					Nie udało się pobrać ulubionych ofert. Spróbuj ponownie za chwilę.
				</p>
			) : favorites.length === 0 ? (
				<p className="rounded-xl bg-white p-8 text-center">
					Nie masz jeszcze ulubionych ofert. Kliknij serduszko przy ofercie w{" "}
					<Link href={routes.search} className="font-semibold text-ink underline">
						wyszukiwarce
					</Link>
					, aby ją tu zapisać.
				</p>
			) : (
				<div className="grid gap-4">
					{favorites.map((property) => (
						<PropertyListItem key={property.id} property={property} favorite />
					))}
				</div>
			)}
		</>
	);
}
