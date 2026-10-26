"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

type Billing = "annual" | "monthly";

const plans = [
	{
		name: "Starter",
		description: "Dla osób, które szukają mieszkania dla siebie w jednym lub kilku miastach.",
		monthly: 59,
		cta: "Wypróbuj za darmo",
		features: ["3 wybrane miasta", "Deduplikacja z 300+ portali", "Alerty e-mail do 5 min", "Historia korekt cen"],
		tile: "bg-pastel-blue",
		featured: false,
	},
	{
		name: "Inwestor PRO",
		description: "Dla inwestorów, którzy chcą dzwonić pierwsi i kupować poniżej rynku.",
		monthly: 149,
		cta: "Wypróbuj za darmo",
		intro: "Wszystko ze Startera, a także:",
		features: [
			"Alerty SMS poniżej 30 s",
			"Cała Polska bez limitu",
			"Ceny transakcyjne RCN",
			"Rysowanie obszarów na mapie",
		],
		tile: "bg-pastel-violet",
		featured: true,
	},
	{
		name: "Biuro",
		description: "Dla biur nieruchomości i zespołów agentów, które pracują na wspólnych danych.",
		monthly: 299,
		cta: "Porozmawiajmy",
		intro: "Wszystko z Inwestora PRO, a także:",
		features: ["Do 10 stanowisk agentów", "Integracja z CRM", "Eksport do CSV i PDF", "Opiekun i SLA 99,9%"],
		tile: "bg-pastel-peach",
		featured: false,
	},
];

/** Annual billing: 12 months for the price of 10. */
function monthlyPrice(monthly: number, billing: Billing): number {
	return billing === "annual" ? Math.round((monthly * 10) / 12) : monthly;
}

export function Pricing() {
	const [billing, setBilling] = useState<Billing>("annual");

	return (
		<section id="cennik" className="py-20">
			<div className="mx-auto max-w-[1170px] px-6">
				<div className="text-center">
					<h2 className="title">Cennik</h2>
					<p className="mx-auto mt-3 max-w-[520px]">
						7 dni za darmo w każdym planie, bez podawania karty. Zrezygnujesz w dowolnym momencie.
					</p>
					<BillingToggle value={billing} onChange={setBilling} />
				</div>

				<div className="mt-12 grid items-start gap-6 md:grid-cols-3">
					{plans.map((plan) => (
						<div
							key={plan.name}
							className={cn(
								"reveal relative flex flex-col rounded-xl p-8",
								plan.tile,
								plan.featured && "ring-2 ring-slate",
							)}
						>
							{plan.featured && (
								<span className="head absolute -top-3 left-8 rounded-full bg-slate px-3 py-1 text-[11px] font-semibold tracking-wider text-white uppercase">
									Najczęściej wybierany
								</span>
							)}
							<h3 className="text-[22px] font-bold">{plan.name}</h3>
							<p className="mt-2 min-h-[48px]">{plan.description}</p>

							<div className="mt-6 flex items-end gap-1.5">
								<span className="head text-[44px] leading-none font-bold">
									{monthlyPrice(plan.monthly, billing)} zł
								</span>
								<span className="pb-1 text-[13px] text-muted">/ miesiąc</span>
							</div>
							<div className="mt-1 text-[13px] text-muted">
								{billing === "annual" ? `płatne rocznie: ${plan.monthly * 10} zł` : "płatne co miesiąc"}
							</div>

							<a
								href="#kontakt"
								className={cn("btn mt-6 w-full", plan.featured ? "btn-slate" : "btn-soft")}
							>
								{plan.cta}
							</a>

							<div className="mt-8 border-t border-ink/10 pt-6">
								{plan.intro && <div className="head mb-3 text-[13px] font-semibold">{plan.intro}</div>}
								<ul className="space-y-2.5">
									{plan.features.map((feature) => (
										<li key={feature} className="flex gap-2.5">
											<Icon icon={Check} className="text-[20px] text-brand" />
											<span className="text-ink">{feature}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function BillingToggle({ value, onChange }: { value: Billing; onChange: (value: Billing) => void }) {
	const options: { value: Billing; label: string }[] = [
		{ value: "annual", label: "Rocznie" },
		{ value: "monthly", label: "Miesięcznie" },
	];

	return (
		<div className="mt-8 flex items-center justify-center gap-3">
			<div className="inline-flex rounded-full bg-mist p-1" role="radiogroup" aria-label="Okres rozliczenia">
				{options.map((option) => (
					<button
						key={option.value}
						type="button"
						role="radio"
						aria-checked={value === option.value}
						onClick={() => onChange(option.value)}
						className={cn(
							"head cursor-pointer rounded-full px-5 py-2 text-[14px] font-semibold transition-colors",
							value === option.value ? "bg-white text-ink ring-1 ring-line" : "text-muted hover:text-ink",
						)}
					>
						{option.label}
					</button>
				))}
			</div>
		</div>
	);
}
