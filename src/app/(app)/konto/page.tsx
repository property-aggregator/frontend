import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/features/account/api";
import { MarketingConsentSwitch } from "@/features/account/marketing-consent-switch";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Konto", robots: { index: false } };

export default function AccountPage() {
	return (
		<main>
			<div className="mx-auto max-w-[1000px] pt-8 sm:px-6 sm:py-10">
				<section className="mt-6 bg-white p-6 sm:rounded-lg sm:border sm:border-line md:p-8">
					<h2 className="head text-2xl font-semibold">Zgody</h2>
					<div className="mt-5 border-t border-line pt-5">
						<Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-mist" />}>
							<MarketingConsent />
						</Suspense>
					</div>
					<p className="mt-5 border-t border-line pt-5 text-sm text-muted">
						Zaakceptowany{" "}
						<Link href={routes.terms} className="font-semibold text-ink hover:text-primary">
							Regulamin
						</Link>{" "}
						jest wymagany do korzystania z serwisu. Szczegóły przetwarzania danych znajdziesz w{" "}
						<Link href={routes.privacy} className="font-semibold text-ink hover:text-primary">
							Polityce prywatności
						</Link>
						.
					</p>
				</section>
			</div>
		</main>
	);
}

async function MarketingConsent() {
	const user = await getCurrentUser();
	return <MarketingConsentSwitch initialGranted={user.marketingConsent} />;
}
