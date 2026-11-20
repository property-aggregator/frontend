"use client";

import { Info } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/** Centred on the top edge of the card, half above it; the explanation shows on hover, or after a tap on phones. */
export function DealPill({ percent }: { percent: number }) {
	const id = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) {
			return;
		}
		const close = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
		document.addEventListener("pointerdown", close);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("pointerdown", close);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [open]);

	return (
		<div
			ref={rootRef}
			// Above the stretched title link of the list item.
			className="head absolute top-0 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--color-brand)_35%,white)] py-1 pr-1.5 pl-3 text-xs font-semibold whitespace-nowrap text-ink shadow-sm"
		>
			Potencjalna okazja −{percent}%
			<button
				type="button"
				onClick={() => setOpen(!open)}
				aria-expanded={open}
				aria-controls={id}
				aria-label="Co oznacza potencjalna okazja"
				className="peer flex cursor-pointer rounded-full p-0.5"
			>
				<Icon icon={Info} className="text-lg" />
			</button>
			<p
				id={id}
				className={cn(
					"pointer-events-none absolute top-full left-1/2 mt-1.5 w-max max-w-[240px] -translate-x-1/2 rounded-md bg-ink px-3 py-2 font-sans text-xs font-normal whitespace-normal text-white shadow-lg transition-opacity peer-hover:visible peer-hover:opacity-100",
					open ? "visible opacity-100" : "invisible opacity-0",
				)}
			>
				Cena o {percent}% niższa od mediany cen ofertowych podobnych nieruchomości.
			</p>
		</div>
	);
}
