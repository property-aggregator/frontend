"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import type { Plan, PlanEntitlements, UserPlan } from "@/features/plans/api";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const planMeta: Record<
	UserPlan,
	{
		name: string;
		/** Used in "Wszystko z planu …". */
		ofName: string;
		description: string;
		cta: string;
		tile: string;
		button: string;
		featured: boolean;
	}
> = {
	free: {
		name: "Darmowy",
		ofName: "darmowego",
		description: "Na start: przeglądaj oferty z całej Polski i zapisuj ulubione bez opłat.",
		cta: "Załóż konto",
		tile: "bg-pastel-blue",
		button: "bg-pastel-blue-deep text-ink hover:bg-[color-mix(in_srgb,var(--color-pastel-blue-deep)_92%,#000)]",
		featured: false,
	},
	plus: {
		name: "Plus",
		ofName: "Plus",
		description: "Dla osób, które szukają mieszkania dla siebie i chcą dostawać alerty o nowych ofertach.",
		cta: "Wybierz Plus",
		tile: "bg-pastel-violet",
		button: "btn-slate",
		featured: true,
	},
	pro: {
		name: "Pro",
		ofName: "Pro",
		description: "Dla inwestorów, którzy chcą dzwonić pierwsi i kupować poniżej rynku.",
		cta: "Wybierz Pro",
		tile: "bg-pastel-peach",
		button: "bg-pastel-peach-deep text-ink hover:bg-[color-mix(in_srgb,var(--color-pastel-peach-deep)_92%,#000)]",
		featured: false,
	},
};

const priceFormat = new Intl.NumberFormat("pl-PL", {
	style: "currency",
	currency: "PLN",
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});

function plural(n: number, one: string, few: string, many: string): string {
	if (n === 1) return one;
	const lastTwo = n % 100;
	const last = n % 10;
	return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
}

function months(n: number): string {
	return `${n} ${plural(n, "miesiąc", "miesiące", "miesięcy")}`;
}

type Feature = { key: string; label: string; value: number };

function features(e: PlanEntitlements): Feature[] {
	const hasAlerts = Number(e.activeAlertsLimit > 0);
	return [
		{ key: "search", label: "Dostęp do wyszukiwarki ofert", value: 1 },
		{ key: "archive", label: "Dostęp do archiwum ofert", value: 1 },
		{
			key: "favorites",
			label: `Do ${e.favoritesLimit} ${plural(e.favoritesLimit, "ulubionej oferty", "ulubionych ofert", "ulubionych ofert")}`,
			value: e.favoritesLimit,
		},
		{
			key: "alerts",
			label: `${e.activeAlertsLimit} ${plural(e.activeAlertsLimit, "aktywny alert", "aktywne alerty", "aktywnych alertów")}`,
			value: e.activeAlertsLimit,
		},
		{
			key: "email",
			label: `${e.monthlyEmailLimit} ${plural(e.monthlyEmailLimit, "e-mail", "e-maile", "e-maili")} miesięcznie`,
			value: e.monthlyEmailLimit,
		},
		{
			key: "sms",
			label: `${e.monthlySmsLimit} ${plural(e.monthlySmsLimit, "SMS", "SMS-y", "SMS-ów")} miesięcznie`,
			value: e.monthlySmsLimit,
		},
		{ key: "instant", label: "Błyskawiczne powiadomienia", value: hasAlerts },
		{ key: "deals", label: "Wykrywanie potencjalnych okazji na terenie całej Polski", value: Number(e.deals) },
		{ key: "history", label: "Historia powiadomień", value: Number(e.notificationHistory) },
	];
}

/** Only what the plan adds over the previous one: new features and higher limits. */
function addedFeatures(plan: Plan, previous: Plan | undefined): Feature[] {
	const before = new Map(previous ? features(previous.entitlements).map((f) => [f.key, f.value]) : []);
	return features(plan.entitlements).filter((f) => f.value > (before.get(f.key) ?? 0));
}

export function PricingPlans({ plans }: { plans: Plan[] }) {
	const durations = [...new Set(plans.flatMap((plan) => plan.offers.map((offer) => offer.durationMonths)))].sort(
		(a, b) => a - b,
	);
	const [duration, setDuration] = useState(durations[0] ?? 1);

	return (
		<>
			{durations.length > 1 && <DurationToggle options={durations} value={duration} onChange={setDuration} />}

			<div className="mt-12 grid items-start gap-6 md:grid-cols-3">
				{plans.map((plan, index) => {
					const meta = planMeta[plan.plan];
					const previous = plans[index - 1];
					return (
						<div
							key={plan.plan}
							className={cn(
								"reveal relative flex flex-col rounded-xl p-8",
								meta.tile,
								meta.featured && "ring-2 ring-slate",
							)}
						>
							{meta.featured && (
								<span className="head absolute -top-3 left-8 rounded-full bg-slate px-3 py-1 text-2xs font-semibold tracking-wider text-white uppercase">
									Najczęściej wybierany
								</span>
							)}
							<h3 className="text-[22px] font-bold">{meta.name}</h3>
							<p className="mt-2 min-h-[72px]">{meta.description}</p>

							<PlanPrice plan={plan} duration={duration} />

							<a href={routes.signup} className={cn("btn mt-6 w-full", meta.button)}>
								{meta.cta}
							</a>

							<div className="mt-8 border-t border-ink/10 pt-6">
								{previous && (
									<div className="head mb-3 text-sm font-semibold">
										Wszystko z planu {planMeta[previous.plan].ofName}, a także:
									</div>
								)}
								<ul className="space-y-2.5">
									{addedFeatures(plan, previous).map((feature) => (
										<li key={feature.key} className="flex gap-2.5">
											<Icon icon={Check} className="text-2xl text-brand" />
											<span className="text-ink">{feature.label}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
}

function PlanPrice({ plan, duration }: { plan: Plan; duration: number }) {
	if (plan.offers.length === 0) {
		return (
			<>
				<div className="mt-6 flex items-end gap-1.5">
					<span className="head text-[44px] leading-none font-bold">{priceFormat.format(0)}</span>
				</div>
				<div className="mt-1 text-sm text-muted">bez limitu czasu</div>
			</>
		);
	}

	const offer = plan.offers.find((o) => o.durationMonths === duration);
	if (!offer) {
		return <div className="mt-6 text-sm text-muted">Niedostępny na {months(duration)}</div>;
	}

	const single = plan.offers.find((o) => o.durationMonths === 1);
	const saving = single && duration > 1 ? single.price * duration - offer.price : 0;

	return (
		<>
			<div className="mt-6 flex items-end gap-1.5">
				<span className="head text-[44px] leading-none font-bold">{priceFormat.format(offer.price)}</span>
				<span className="pb-1 text-sm text-muted">/ {months(duration)}</span>
			</div>
			<div className="mt-1 text-sm text-muted">
				{duration > 1
					? `${priceFormat.format(offer.price / duration)} miesięcznie${saving > 0 ? `, oszczędzasz ${priceFormat.format(saving)}` : ""}`
					: "płatność jednorazowa"}
			</div>
		</>
	);
}

function DurationToggle({
	options,
	value,
	onChange,
}: {
	options: number[];
	value: number;
	onChange: (value: number) => void;
}) {
	return (
		<div className="mt-8 flex items-center justify-center gap-3">
			<div className="inline-flex rounded-full bg-mist p-1" role="radiogroup" aria-label="Okres">
				{options.map((option) => (
					<button
						key={option}
						type="button"
						role="radio"
						aria-checked={value === option}
						onClick={() => onChange(option)}
						className={cn(
							"head cursor-pointer rounded-full px-5 py-2 text-base font-semibold transition-colors",
							value === option ? "bg-white text-ink" : "text-muted hover:text-ink",
						)}
					>
						{months(option)}
					</button>
				))}
			</div>
		</div>
	);
}
