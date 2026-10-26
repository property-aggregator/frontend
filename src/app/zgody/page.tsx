import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LogoMark } from "@/components/logo";
import { getCurrentUser } from "@/features/account/api";
import { ConsentsForm } from "@/features/consents/consents-form";
import { safeReturnTo } from "@/features/consents/return-to";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Zgody", robots: { index: false } };

type ConsentsPageProps = { searchParams: Promise<{ returnTo?: string | string[] }> };

export default function ConsentsPage({ searchParams }: ConsentsPageProps) {
	return (
		<main className="grid min-h-screen place-items-center bg-mist px-6 py-12">
			<div className="w-full max-w-[520px] rounded-xl border border-line bg-white p-8 md:p-10">
				<LogoMark />
				<h1 className="title mt-6 text-[28px]">Zanim zaczniesz</h1>
				<p className="mt-3">
					Aby korzystać z serwisu, zaakceptuj regulamin. Zgoda na wiadomości marketingowe jest dobrowolna.
				</p>
				<Suspense fallback={<div className="mt-8 h-52 animate-pulse rounded-lg bg-mist" />}>
					<Consents searchParams={searchParams} />
				</Suspense>
				<a href={routes.logout} className="mt-6 inline-block text-[13px] text-muted underline">
					Wyloguj się
				</a>
			</div>
		</main>
	);
}

async function Consents({ searchParams }: ConsentsPageProps) {
	const returnTo = safeReturnTo((await searchParams).returnTo);
	const user = await getCurrentUser();
	if (user.termsAccepted) {
		redirect(returnTo);
	}

	return <ConsentsForm returnTo={returnTo} />;
}
