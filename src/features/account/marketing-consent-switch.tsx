"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { updateMarketingConsent } from "./actions";

export function MarketingConsentSwitch({ initialGranted }: { initialGranted: boolean }) {
	const [granted, setGranted] = useState(initialGranted);
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function toggle() {
		const next = !granted;
		setError(null);
		startTransition(async () => {
			const result = await updateMarketingConsent(next);
			startTransition(() => {
				if (result.error) {
					setError(result.error);
				} else {
					setGranted(next);
				}
			});
		});
	}

	return (
		<div>
			<div className="flex items-start justify-between gap-6">
				<div>
					<p id="marketing-consent-label" className="head text-[15px] font-semibold">
						Wiadomości marketingowe
					</p>
					<p className="mt-1">
						Informacje o nowościach i ofertach wysyłane e-mailem. Zgoda jest dobrowolna i możesz ją wycofać
						w każdej chwili.
					</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-checked={granted}
					aria-labelledby="marketing-consent-label"
					onClick={toggle}
					disabled={pending}
					className={cn(
						"relative mt-1 h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-default disabled:opacity-50",
						granted ? "bg-slate" : "bg-line",
					)}
				>
					<span
						className={cn(
							"absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
							granted && "translate-x-5",
						)}
					/>
				</button>
			</div>
			<p className={cn("mt-3 text-[13px]", error ? "font-semibold text-ink" : "text-muted")} role="status">
				{error ?? (granted ? "Zgoda udzielona." : "Zgoda nieudzielona.")}
			</p>
		</div>
	);
}
