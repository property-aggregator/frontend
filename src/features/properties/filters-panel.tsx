"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

type FiltersPanelProps = {
	activeCount?: number;
	/** "card": a card with a heading on large screens; "bare": just the content. */
	variant?: "card" | "bare";
	/** What the phone button says: "Filtry" or "Szukaj". */
	button?: "filters" | "search";
	children: React.ReactNode;
};

/** On large screens the content as is; on phones a "Filtry" button that opens it full screen. */
export function FiltersPanel({ activeCount = 0, variant = "card", button = "filters", children }: FiltersPanelProps) {
	const card = variant === "card";
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) {
			return;
		}
		const overflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.body.style.overflow = overflow;
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [open]);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="head flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-white py-2.5 text-[15px] font-semibold text-ink lg:hidden"
			>
				<Icon icon={button === "search" ? Search : SlidersHorizontal} className="text-[18px]" />
				{button === "search" ? "Szukaj" : "Filtry"}
				{activeCount > 0 && (
					<span className="grid h-5 min-w-5 place-items-center rounded-full bg-slate px-1.5 text-[11px] text-white">
						{activeCount}
					</span>
				)}
			</button>
			<div
				role={open ? "dialog" : undefined}
				aria-modal={open || undefined}
				aria-label="Filtry"
				// Applying or clearing the filters navigates, so the full-screen panel closes.
				onSubmit={() => setOpen(false)}
				onClick={(event) => (event.target as Element).closest("a") && setOpen(false)}
				className={cn(
					open ? "fixed inset-0 z-[60] flex flex-col bg-white" : "hidden",
					"lg:static lg:z-auto lg:block",
					card && "lg:rounded-xl lg:border lg:border-line lg:bg-white lg:p-5",
				)}
			>
				<div
					className={cn(
						"flex items-center justify-between border-b border-line px-5 py-4",
						card ? "lg:border-0 lg:p-0" : "lg:hidden",
					)}
				>
					<h2 className="head text-[20px] font-semibold">Filtry</h2>
					<button
						type="button"
						onClick={() => setOpen(false)}
						className="grid h-10 w-10 cursor-pointer place-items-center rounded-md text-ink lg:hidden"
						aria-label="Zamknij filtry"
					>
						<Icon icon={X} />
					</button>
				</div>
				<div className={cn("flex-1 overflow-y-auto p-5 lg:overflow-visible lg:p-0", card && "lg:mt-4")}>
					{children}
				</div>
			</div>
		</>
	);
}
