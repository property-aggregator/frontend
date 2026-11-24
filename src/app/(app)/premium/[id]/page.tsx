import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/icon";
import { getQuote, type PlanQuote } from "@/features/plans/api";
import { dateFormat, months, planNames, priceFormat } from "@/features/plans/format";
import { premiumOfferUrl, routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Podsumowanie zakupu", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type QuotePageProps = {
	params: Promise<{ id: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function QuotePage(props: QuotePageProps) {
	return (
		<main>
			<div className="mx-auto max-w-[640px] pt-6 sm:px-6 sm:py-10">
				<Link
					href={routes.premium}
					className="head mb-6 ml-6 inline-flex items-center gap-1 text-base font-semibold hover:text-primary sm:ml-0"
				>
					<Icon icon={ChevronLeft} className="text-xl" />
					Wróć do planów
				</Link>
				<div className="bg-white px-6 py-8 sm:rounded-lg sm:border sm:border-line sm:p-8 md:p-10">
					<Suspense fallback={<div className="h-[420px] animate-pulse rounded-lg bg-mist" />}>
						<QuoteView {...props} />
					</Suspense>
				</div>
			</div>
		</main>
	);
}

async function QuoteView({ params, searchParams }: QuotePageProps) {
	const { id } = await params;
	const { kod } = await searchParams;
	const promoCode = typeof kod === "string" ? kod.trim() : "";
	if (!UUID.test(id)) {
		notFound();
	}

	let result = await getQuote(id, promoCode || undefined);
	let promoError: string | undefined;

	if ("error" in result) {
		if (result.error === "invalid_promo_code") {
			promoError = "Ten kod jest nieprawidłowy albo już wygasł.";
		} else if (result.error === "too_many_requests") {
			const wait = result.retryAfterSeconds ? `za ${result.retryAfterSeconds} s` : "za chwilę";
			promoError = `Za dużo prób z kodem rabatowym. Spróbuj ponownie ${wait}.`;
		}
		if (promoError) {
			result = await getQuote(id);
		}
	}

	if ("error" in result) {
		if (result.error === "plan_lower_than_current") {
			return (
				<div className="text-center">
					<h1 className="title text-3xl">Masz już wyższy plan</h1>
					<p className="mt-3">
						Ten plan będzie można kupić, gdy wygaśnie Twój obecny. Możesz za to przedłużyć plan, który masz.
					</p>
					<Link href={routes.premium} className="btn btn-primary mt-6">
						Zobacz plany
					</Link>
				</div>
			);
		}
		notFound();
	}

	return <QuoteSummary quote={result.quote} promoCode={promoCode} promoError={promoError} />;
}

function QuoteSummary({ quote, promoCode, promoError }: { quote: PlanQuote; promoCode: string; promoError?: string }) {
	return (
		<>
			<h1 className="title text-3xl">
				Plan {planNames[quote.plan]} na {months(quote.durationMonths)}
			</h1>
			<p className="mt-3">
				Plan będzie aktywny od <b className="text-ink">{dateFormat.format(new Date(quote.startsAt))}</b> do{" "}
				<b className="text-ink">{dateFormat.format(new Date(quote.expiresAt))}</b>.
			</p>

			<dl className="mt-8 space-y-3 border-t border-line pt-6">
				<div className="flex justify-between gap-4">
					<dt>Cena</dt>
					<dd className="text-ink">{priceFormat.format(quote.listPrice)}</dd>
				</div>
				{quote.discountAmount > 0 && (
					<div className="flex justify-between gap-4">
						<dt>
							Rabat {promoCode && <span className="font-semibold text-ink">{promoCode}</span>} (−
							{quote.discountPercent}%)
						</dt>
						<dd className="text-price-down">−{priceFormat.format(quote.discountAmount)}</dd>
					</div>
				)}
				<div className="flex justify-between gap-4 border-t border-line pt-3">
					<dt className="head text-lg font-semibold">Do zapłaty</dt>
					<dd className="head text-2xl font-bold">{priceFormat.format(quote.amountToPay)}</dd>
				</div>
			</dl>

			<Form action={premiumOfferUrl(quote.offerId)} className="mt-8">
				<label htmlFor="promo-code" className="head text-sm font-semibold">
					Kod rabatowy
				</label>
				<div className="mt-2 flex flex-col gap-3 sm:flex-row">
					<input
						id="promo-code"
						name="kod"
						type="text"
						autoComplete="off"
						defaultValue={promoCode}
						aria-invalid={promoError ? true : undefined}
						aria-describedby={promoError ? "promo-code-error" : undefined}
						className="field"
					/>
					<button type="submit" className="btn btn-soft shrink-0">
						Zastosuj
					</button>
				</div>
				{promoError && (
					<p
						id="promo-code-error"
						role="alert"
						className="head mt-3 rounded-lg bg-pastel-red/10 px-4 py-3 font-semibold"
					>
						{promoError}
					</p>
				)}
			</Form>

			<button
				type="button"
				disabled
				className="btn btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-60"
			>
				Przejdź do płatności
			</button>
			<p className="mt-3 text-center text-sm text-muted">Płatności online uruchomimy wkrótce.</p>
		</>
	);
}
