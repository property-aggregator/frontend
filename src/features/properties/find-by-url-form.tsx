"use client";

import { Search } from "lucide-react";
import { useActionState, useState } from "react";
import { Icon } from "@/components/icon";
import { findPropertyByUrl, type FindPropertyState } from "./actions";

export function FindByUrlForm() {
	const [state, action, pending] = useActionState<FindPropertyState, FormData>(findPropertyByUrl, {});
	// Editing the link hides the outcome of the previous search, which no longer applies to it.
	const [dismissed, setDismissed] = useState<FindPropertyState | null>(null);
	const visible = dismissed !== state;
	const fieldError = visible ? state.fieldError : undefined;
	const notice = visible ? state.notice : undefined;

	return (
		<form action={action} className="mt-8">
			<label htmlFor="property-url" className="head text-sm font-semibold">
				Link do ogłoszenia
			</label>
			<div className="mt-2 flex flex-col gap-3 sm:flex-row">
				<input
					id="property-url"
					name="url"
					type="text"
					inputMode="url"
					autoComplete="off"
					required
					defaultValue={state.url}
					onChange={() => setDismissed(state)}
					placeholder="https://www.otodom.pl/pl/oferta/..."
					aria-invalid={fieldError ? true : undefined}
					aria-describedby={fieldError ? "property-url-error" : undefined}
					className="field"
				/>
				<button
					type="submit"
					disabled={pending}
					className="btn btn-slate shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<Icon icon={Search} className="text-xl" />
					Szukaj
				</button>
			</div>
			{fieldError && (
				<p
					id="property-url-error"
					role="alert"
					className="head mt-5 rounded-lg bg-pastel-red/10 px-4 py-3.5 font-semibold"
				>
					{fieldError}
				</p>
			)}
			{notice && (
				<div role="status" className="mt-5 rounded-lg bg-mist px-4 py-3.5">
					<p className="head font-semibold">{notice.title}</p>
					<p className="text-sm">{notice.text}</p>
				</div>
			)}
		</form>
	);
}
