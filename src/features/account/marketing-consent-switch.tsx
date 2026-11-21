"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/switch";
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
					<p id="marketing-consent-label" className="head text-md font-semibold">
						Wiadomości marketingowe
					</p>
					<p className="mt-1">
						Informacje o nowościach i ofertach wysyłane e-mailem. Zgoda jest dobrowolna i możesz ją wycofać
						w każdej chwili.
					</p>
				</div>
				<Switch
					checked={granted}
					onChange={toggle}
					labelledBy="marketing-consent-label"
					disabled={pending}
					className="mt-1"
				/>
			</div>
			<p className={cn("mt-3 text-sm", error ? "font-semibold text-ink" : "text-muted")} role="status">
				{error ?? (granted ? "Zgoda udzielona." : "Zgoda nieudzielona.")}
			</p>
		</div>
	);
}
