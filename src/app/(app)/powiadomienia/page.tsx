import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { getNotifications, type NotificationsPage } from "@/features/notifications/api";
import { NotificationsList } from "@/features/notifications/notifications-list";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Powiadomienia", robots: { index: false } };

export default function NotificationsPage() {
	return (
		<main>
			<div className="mx-auto max-w-[1000px] px-3 py-10 sm:px-6">
				<h1 className="title text-2xl lg:text-3xl">Powiadomienia</h1>
				<p className="mt-1 mb-6 text-muted lg:mb-8">
					Nowe oferty z Twoich alertów oraz zmiany w ulubionych ofertach.
				</p>
				<Suspense fallback={<NotificationsSkeleton />}>
					<Notifications />
				</Suspense>
			</div>
		</main>
	);
}

async function loadNotifications(): Promise<NotificationsPage | null> {
	try {
		return await getNotifications();
	} catch (error) {
		unstable_rethrow(error);
		console.error("Failed to load the notifications", error);
		return null;
	}
}

async function Notifications() {
	const page = await loadNotifications();

	if (!page) {
		return (
			<p className="rounded-lg border border-line bg-white p-8 text-center">
				Nie udało się pobrać powiadomień. Spróbuj ponownie za chwilę.
			</p>
		);
	}

	if (page.items.length === 0) {
		return (
			<p className="rounded-lg border border-line bg-white p-8 text-center">
				Nie masz jeszcze powiadomień. Ustaw{" "}
				<Link href={routes.alerts} className="font-semibold text-ink hover:text-primary">
					alert
				</Link>{" "}
				albo dodaj oferty do{" "}
				<Link href={routes.favorites} className="font-semibold text-ink hover:text-primary">
					ulubionych
				</Link>
				, a damy Ci znać o nowościach i zmianach cen.
			</p>
		);
	}

	return <NotificationsList initialPage={page} />;
}

function NotificationsSkeleton() {
	return (
		<div className="grid gap-3" aria-hidden="true">
			{Array.from({ length: 4 }, (_, index) => (
				<div key={index} className="h-[132px] animate-pulse rounded-xl bg-mist" />
			))}
		</div>
	);
}
