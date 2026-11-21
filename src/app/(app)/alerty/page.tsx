import { Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/icon";
import { getCurrentUser } from "@/features/account/api";
import { AlertsManager } from "@/features/alerts/alerts-manager";
import {
	getNotificationSettings,
	getSearchAlerts,
	type NotificationSettings,
	type SearchAlert,
} from "@/features/alerts/api";
import { ContactsProvider } from "@/features/alerts/contacts";
import { NotificationSettingsForm } from "@/features/alerts/notification-settings-form";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Alerty", robots: { index: false } };

export default function AlertsPage() {
	return (
		<main>
			<div className="mx-auto max-w-[1360px] px-3 py-10 sm:px-6">
				<h1 className="title text-2xl lg:text-3xl">Alerty</h1>
				<p className="mt-1 mb-6 text-muted lg:mb-8">
					Ustaw kryteria, a powiadomimy Cię o nowych ofertach, gdy tylko się pojawią.
				</p>
				<Suspense fallback={<AlertsSkeleton />}>
					<AlertsView />
				</Suspense>
			</div>
		</main>
	);
}

async function load<T>(what: string, request: () => Promise<T>): Promise<T | null> {
	try {
		return await request();
	} catch (error) {
		unstable_rethrow(error);
		console.error(`Failed to load the ${what}`, error);
		return null;
	}
}

async function AlertsView() {
	const [user, alerts, settings] = await Promise.all([
		getCurrentUser(),
		load<SearchAlert[]>("search alerts", getSearchAlerts),
		load<NotificationSettings>("notification settings", getNotificationSettings),
	]);
	const { activeAlertsLimit, monthlySmsLimit } = user.entitlements;
	const smsAvailable = monthlySmsLimit > 0;

	return (
		<ContactsProvider initial={settings}>
			<div className="grid items-start gap-5 lg:grid-cols-[1fr_380px] lg:gap-6">
				<section className="min-w-0">
					{alerts ? (
						<AlertsManager
							initialAlerts={alerts}
							activeAlertsLimit={activeAlertsLimit}
							smsAvailable={smsAvailable}
						/>
					) : (
						<p className="rounded-xl bg-white p-8 text-center">
							Nie udało się pobrać alertów. Spróbuj ponownie za chwilę.
						</p>
					)}
				</section>
				{/* A sticky column on large screens, as the filters of the search. On phones its parts join the page's grid:
				    the contacts, then the upsell, both above the alerts. */}
				<aside className="contents lg:sticky lg:top-[100px] lg:grid lg:gap-5">
					<section className="rounded-xl bg-white p-5 max-lg:order-first md:p-6">
						<h2 className="head text-xl font-semibold">Dane kontaktowe</h2>
						<p className="mt-1 mb-5 text-sm text-muted">Na te dane wyślemy powiadomienia z alertów.</p>
						{settings ? (
							<NotificationSettingsForm initial={settings} />
						) : (
							<p>Nie udało się pobrać danych kontaktowych. Spróbuj ponownie za chwilę.</p>
						)}
					</section>
					{!smsAvailable && <SmsUpsell className="max-lg:order-first" />}
				</aside>
			</div>
		</ContactsProvider>
	);
}

function SmsUpsell({ className }: { className?: string }) {
	return (
		<section className={cn("rounded-xl bg-slate p-6 text-white", className)}>
			<p className="head flex items-center gap-1.5 text-2xs font-semibold tracking-wider text-white/80 uppercase">
				<Icon icon={Star} className="text-base" />
				Premium
			</p>
			<h2 className="head mt-2 text-xl font-semibold text-white">Powiadomienia SMS</h2>
			<p className="mt-2 text-sm text-white/80">
				Dowiaduj się o nowych ofertach od razu, SMS-em. W nieruchomościach liczy się czas.
			</p>
			<Link href={routes.premium} className="btn btn-sm btn-light mt-5 w-full">
				Zobacz plany
			</Link>
		</section>
	);
}

function AlertsSkeleton() {
	return (
		<div className="grid items-start gap-5 lg:grid-cols-[1fr_380px] lg:gap-6" aria-hidden="true">
			<div className="h-[300px] animate-pulse rounded-xl bg-white lg:col-start-2 lg:row-start-1" />
			<div className="grid gap-4 lg:col-start-1 lg:row-start-1">
				<div className="h-[152px] animate-pulse rounded-xl bg-white" />
				<div className="h-[152px] animate-pulse rounded-xl bg-white" />
			</div>
		</div>
	);
}
