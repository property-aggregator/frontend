import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getCurrentUser } from "@/features/account/api";
import { getPlans } from "@/features/plans/api";
import { PricingPlans } from "@/features/plans/pricing-plans";

export const metadata: Metadata = { title: "Premium", robots: { index: false } };

export default function PremiumPage() {
	return (
		<main data-full-bleed>
			<div className="mx-auto max-w-[1170px] sm:px-6 sm:py-10">
				<div className="bg-white px-6 py-8 sm:rounded-xl sm:p-8 md:p-10">
					<div className="text-center">
						<h1 className="title text-3xl">Wybierz plan</h1>
						<p className="mx-auto mt-3 max-w-[520px]">
							Płacisz raz za wybrany okres, bez subskrypcji i automatycznego odnawiania.
						</p>
					</div>
					<Suspense fallback={<div className="mt-8 h-[640px] animate-pulse rounded-xl bg-mist" />}>
						<Plans />
					</Suspense>
				</div>
			</div>
		</main>
	);
}

async function Plans() {
	// Depends on the signed-in user, so render per request; also keeps getPlans() from calling the API during next build.
	await connection();

	const [user, plans] = await Promise.all([getCurrentUser(), getPlans()]);

	return <PricingPlans plans={plans} current={user.plan} currentExpiresAt={user.planExpiresAt} />;
}
