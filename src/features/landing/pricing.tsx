import { io } from "next/cache";
import { Suspense } from "react";
import { getPlans, type Plan } from "@/features/plans/api";
import { PricingPlans } from "@/features/plans/pricing-plans";

async function loadPlans(): Promise<Plan[] | null> {
	try {
		return await getPlans();
	} catch (error) {
		console.error("Failed to load plans", error);
		return null;
	}
}

export function Pricing() {
	return (
		<section id="cennik" className="py-20">
			<div className="mx-auto max-w-[1170px] px-6">
				<div className="text-center">
					<h2 className="title">Cennik</h2>
					<p className="mx-auto mt-3 max-w-[520px]">
						Płacisz raz za wybrany okres, bez subskrypcji i automatycznego odnawiania. Ceny brutto.
					</p>
				</div>
				<Suspense fallback={<div className="mt-8 h-[640px] animate-pulse rounded-lg bg-mist" />}>
					<PlansList />
				</Suspense>
			</div>
		</section>
	);
}

async function PlansList() {
	// io() keeps the API call out of the build, so the page builds without the backend running.
	await io();
	const plans = await loadPlans();

	if (!plans || plans.length === 0) {
		return (
			<p className="mt-12 rounded-lg bg-mist p-8 text-center">
				Nie udało się pobrać cennika. Spróbuj ponownie za chwilę.
			</p>
		);
	}

	return <PricingPlans plans={plans} reveal />;
}
