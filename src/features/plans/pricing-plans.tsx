"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import type { Plan, PlanEntitlements, PlanOffer, UserPlan } from "@/features/plans/api";
import { dateFormat, months, planNames, plural, priceFormat } from "@/features/plans/format";
import { premiumOfferUrl, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const planMeta: Record<
	UserPlan,
	{
		/** Used in "Wszystko z planu …". */
		ofName: string;
		description: string;
		cta: string;
		tile: string;
		button: string;
		/** Ring and badge of the highlighted card. */
		accent: { ring: string; badge: string };
		featured: boolean;
	}
> = {
	free: {
		ofName: "darmowego",
		description: "Na start: przeglądaj oferty z całej Polski i zapisuj ulubione bez opłat.",
		cta: "Załóż konto",
		tile: "bg-pastel-blue",
		button: "bg-pastel-blue-deep text-ink hover:bg-[color-mix(in_srgb,var(--color-pastel-blue-deep)_92%,#000)]",
		accent: { ring: "ring-pastel-blue-deep", badge: "bg-pastel-blue-deep text-ink" },
		featured: false,
	},
	plus: {
		ofName: "Plus",
		description: "Dla osób, które szukają mieszkania dla siebie i chcą dostawać alerty o nowych ofertach.",
		cta: "Wybierz Plus",
		tile: "bg-pastel-violet",
		button: "btn-slate",
		accent: { ring: "ring-slate", badge: "bg-slate text-white" },
		featured: true,
	},
	pro: {
		ofName: "Pro",
		description: "Dla inwestorów, którzy chcą dzwonić pierwsi i kupować poniżej rynku.",
		cta: "Wybierz Pro",
		tile: "bg-pastel-peach",
		button: "bg-pastel-peach-deep text-ink hover:bg-[color-mix(in_srgb,var(--color-pastel-peach-deep)_92%,#000)]",
		accent: { ring: "ring-pastel-peach-deep", badge: "bg-pastel-peach-deep text-ink" },
		featured: false,
	},
};

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

type PricingPlansProps = {
	plans: Plan[];
	/** The signed-in user's plan; without it every button leads to sign-up. */
	current?: UserPlan;
	currentExpiresAt?: string | null;
	/** Fade the cards in on scroll; needs RevealOnScroll on the page. */
	reveal?: boolean;
};

export function PricingPlans({ plans, current, currentExpiresAt, reveal = false }: PricingPlansProps) {
	const durations = [...new Set(plans.flatMap((plan) => plan.offers.map((offer) => offer.durationMonths)))].sort(
		(a, b) => a - b,
	);
	const [duration, setDuration] = useState(durations[0] ?? 1);
	const currentRank = plans.findIndex((plan) => plan.plan === current);

	return (
		<>
			{durations.length > 1 && <DurationToggle options={durations} value={duration} onChange={setDuration} />}

			<div className="mt-12 grid items-start gap-6 md:grid-cols-3">
				{plans.map((plan, index) => {
					const meta = planMeta[plan.plan];
					const previous = plans[index - 1];
					const offer = plan.offers.find((o) => o.durationMonths === duration);
					const isCurrent = plan.plan === current;
					return (
						<div
							key={plan.plan}
							className={cn(
								"relative flex flex-col rounded-xl p-8",
								reveal && "reveal",
								meta.tile,
								(isCurrent || (!current && meta.featured)) && ["ring-2", meta.accent.ring],
							)}
						>
							{(isCurrent || (!current && meta.featured)) && (
								<span
									className={cn(
										"head absolute -top-3 left-8 rounded-full px-3 py-1 text-2xs font-semibold tracking-wider uppercase",
										meta.accent.badge,
									)}
								>
									{isCurrent ? "Twój plan" : "Najczęściej wybierany"}
								</span>
							)}
							<h3 className="text-[22px] font-bold">{planNames[plan.plan]}</h3>
							<p className="mt-2 min-h-[72px]">{meta.description}</p>

							<PlanPrice plan={plan} offer={offer} duration={duration} />

							<PlanButton
								plan={plan}
								offer={offer}
								current={current}
								below={currentRank > index}
								className={cn("btn mt-6 w-full", meta.button)}
							/>
							{isCurrent && currentExpiresAt && (
								<p className="mt-2 text-center text-sm text-muted">
									Ważny do {dateFormat.format(new Date(currentExpiresAt))}
								</p>
							)}

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

function PlanButton({
	plan,
	offer,
	current,
	below,
	className,
}: {
	plan: Plan;
	offer: PlanOffer | undefined;
	current: UserPlan | undefined;
	below: boolean;
	className: string;
}) {
	if (!current) {
		// Plain <a>: sign-up is an Auth0 route handler, so Link must not prefetch it.
		return (
			<a href={routes.signup} className={className}>
				{planMeta[plan.plan].cta}
			</a>
		);
	}

	const disabled = (label: string) => (
		<span aria-disabled="true" className={cn(className, "pointer-events-none opacity-60")}>
			{label}
		</span>
	);

	if (plan.plan === current && plan.offers.length === 0) return disabled("Twój obecny plan");
	if (below || plan.offers.length === 0) return disabled("Zawarty w Twoim planie");
	if (!offer) return disabled("Niedostępny");

	return (
		<Link href={premiumOfferUrl(offer.id)} className={className}>
			{plan.plan === current ? `Przedłuż ${planNames[plan.plan]}` : planMeta[plan.plan].cta}
		</Link>
	);
}

function PlanPrice({ plan, offer, duration }: { plan: Plan; offer: PlanOffer | undefined; duration: number }) {
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
