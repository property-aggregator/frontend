"use client";

import { useState, type FormEvent } from "react";

// TODO: send the request to the backend once there is an endpoint for it.
export function ContactForm() {
	const [sent, setSent] = useState(false);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		event.currentTarget.reset();
		setSent(true);
	}

	return (
		<form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
			<input
				className="field"
				name="name"
				placeholder="Imię *"
				aria-label="Imię"
				autoComplete="given-name"
				required
			/>
			<input
				className="field"
				name="email"
				type="email"
				placeholder="E-mail *"
				aria-label="E-mail"
				autoComplete="email"
				required
			/>
			<input
				className="field"
				name="phone"
				type="tel"
				placeholder="Telefon *"
				aria-label="Telefon"
				autoComplete="tel"
				required
			/>
			<input
				className="field"
				name="city"
				placeholder="Miasto"
				aria-label="Miasto"
				autoComplete="address-level2"
			/>
			<button type="submit" className="btn btn-slate justify-self-start sm:col-span-2">
				Wyślij zgłoszenie
			</button>
			{sent && (
				<p className="head font-semibold text-ink sm:col-span-2" role="status">
					Dziękujemy! Odezwiemy się wkrótce.
				</p>
			)}
		</form>
	);
}
