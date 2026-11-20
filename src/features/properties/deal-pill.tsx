"use client";

import { Info } from "lucide-react";
import { useId } from "react";
import { Icon } from "@/components/icon";
import { toggletipClassName, useToggletip } from "@/components/toggletip";
import { cn } from "@/lib/utils";

/** Centred on the top edge of the card, half above it. The "i" only hints at the explanation: the whole pill shows it. */
export function DealPill({ percent }: { percent: number }) {
	const id = useId();
	const { ref, bubbleRef, visible, triggerProps } = useToggletip<HTMLDivElement>();

	return (
		<div
			ref={ref}
			// Above the stretched title link and the price change pill of the list item; with its bubble shown, above any other pill too, but under the header.
			className={cn("absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2", visible ? "z-40" : "z-30")}
		>
			<button
				type="button"
				{...triggerProps}
				aria-controls={id}
				className="head flex h-7 cursor-pointer items-center gap-1 rounded-full bg-pastel-green pr-2 pl-3 text-sm font-semibold whitespace-nowrap text-ink"
			>
				Potencjalna okazja −{percent}%
				<Icon icon={Info} className="text-lg" />
			</button>
			<span ref={bubbleRef} id={id} className={toggletipClassName(visible, "left-1/2 -translate-x-1/2")}>
				Cena o {percent}% niższa od mediany cen ofertowych podobnych nieruchomości.
			</span>
		</div>
	);
}
