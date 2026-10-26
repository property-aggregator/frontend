"use client";

import Link from "next/link";
import { useActionState } from "react";
import { routes } from "@/lib/routes";
import { submitConsents, type ConsentsState } from "./actions";

export function ConsentsForm({ returnTo }: { returnTo: string }) {
	const [state, action, pending] = useActionState<ConsentsState, FormData>(submitConsents, {});

	return (
		<form action={action} className="mt-8 space-y-4">
			<input type="hidden" name="returnTo" value={returnTo} />

			<label className="flex items-start gap-3">
				<input type="checkbox" name="acceptTerms" required className="mt-1 h-4 w-4 shrink-0 accent-ink" />
				<span>
					Akceptuję{" "}
					<Link
						href={routes.terms}
						target="_blank"
						rel="noopener noreferrer"
						className="font-semibold text-ink underline"
					>
						Regulamin
					</Link>{" "}
					i potwierdzam zapoznanie się z{" "}
					<Link
						href={routes.privacy}
						target="_blank"
						rel="noopener noreferrer"
						className="font-semibold text-ink underline"
					>
						Polityką prywatności
					</Link>
					. <span className="text-muted">(wymagane)</span>
				</span>
			</label>

			<label className="flex items-start gap-3">
				<input type="checkbox" name="marketingConsent" className="mt-1 h-4 w-4 shrink-0 accent-ink" />
				<span>
					Chcę otrzymywać e-mailem informacje o nowościach i ofertach.{" "}
					<span className="text-muted">(opcjonalne, możesz to zmienić w każdej chwili)</span>
				</span>
			</label>

			{state.error && (
				<p role="alert" className="text-[14px] font-semibold text-ink">
					{state.error}
				</p>
			)}

			<button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
				Zapisz i przejdź dalej
			</button>
		</form>
	);
}
