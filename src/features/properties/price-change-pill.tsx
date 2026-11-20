"use client";

import { useId } from "react";
import { toggletipClassName, useToggletip } from "@/components/toggletip";
import { cn } from "@/lib/utils";

const amountFormat = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });
const changeAmountFormat = new Intl.NumberFormat("pl-PL", {
	style: "currency",
	currency: "PLN",
	maximumFractionDigits: 0,
	signDisplay: "exceptZero",
});
const changePercentFormat = new Intl.NumberFormat("pl-PL", {
	style: "percent",
	maximumFractionDigits: 2,
	signDisplay: "exceptZero",
});

type PriceChangeTextProps = {
	amount: number | null;
	/** 0–100 as sent by the API. */
	percent: number | null;
	/** Puts the percent under the amount on phones. */
	stacked?: boolean;
	className?: string;
};

/** A pill: green for a drop, red for a rise; hovering or tapping it says by how much the seller changed the price. */
export function PriceChangeText({ amount, percent, stacked, className }: PriceChangeTextProps) {
	const id = useId();
	const { ref, bubbleRef, visible, triggerProps } = useToggletip<HTMLSpanElement>();

	if (amount === null || amount === 0) {
		return null;
	}

	return (
		// Above the stretched title link and the source link of the list item; with its bubble shown, above the other pills too, but under the header.
		<span ref={ref} className={cn("relative inline-flex", visible ? "z-40" : "z-20", className)}>
			<button
				type="button"
				{...triggerProps}
				aria-controls={id}
				className={cn(
					"head inline-flex h-7 cursor-pointer items-center gap-1 rounded-full px-2.5 text-sm font-semibold text-ink",
					amount < 0 ? "bg-pastel-green" : "bg-pastel-rose",
					stacked && "max-sm:h-auto max-sm:rounded-xl max-sm:py-0.5",
				)}
			>
				<span className={cn("flex gap-1", stacked && "max-sm:flex-col max-sm:gap-0")}>
					<span>{changeAmountFormat.format(amount)}</span>
					{percent !== null && <span>({changePercentFormat.format(percent / 100)})</span>}
				</span>
			</button>
			<span ref={bubbleRef} id={id} className={toggletipClassName(visible, "left-0")}>
				Sprzedający {amount < 0 ? "obniżył" : "podniósł"} cenę o {amountFormat.format(Math.abs(amount))}.
			</span>
		</span>
	);
}
