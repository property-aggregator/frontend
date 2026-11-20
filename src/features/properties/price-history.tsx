import type { PriceChange } from "@/features/properties/api";
import { PriceChangeText } from "@/features/properties/price-change-pill";
import { priceFormat } from "@/features/properties/property-card";
import { cn } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeZone: "Europe/Warsaw" });
const dateTimeFormat = new Intl.DateTimeFormat("pl-PL", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "Europe/Warsaw",
});

export function PriceHistory({ changes, lastSeenAt }: { changes: PriceChange[]; lastSeenAt: string }) {
	const newestFirst = changes.toReversed();

	return (
		<ol className="relative flex flex-col gap-6">
			<span className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-line" aria-hidden="true" />
			<li className="relative flex justify-center">
				<span className="bg-white px-3 py-1 text-sm text-muted">
					Ostatnio widziano{" "}
					<time dateTime={lastSeenAt} className="font-semibold text-ink">
						{dateTimeFormat.format(new Date(lastSeenAt))}
					</time>
				</span>
			</li>
			{newestFirst.map((change, index) => (
				<li
					key={`${change.changedAt}-${index}`}
					className="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4"
				>
					<p className="text-right text-sm text-muted">
						{index === newestFirst.length - 1 ? (
							"Dodano"
						) : (
							<>
								<span className="sm:hidden">Zmiana</span>
								<span className="max-sm:hidden">Zaktualizowano</span>
							</>
						)}{" "}
						<time dateTime={change.changedAt} className="font-semibold text-ink max-sm:block">
							{dateFormat.format(new Date(change.changedAt))}
						</time>
					</p>
					<span
						className={cn(
							"head bg-white px-2 py-2 text-lg font-bold sm:px-3 sm:text-xl",
							change.price === null && "text-muted",
						)}
					>
						{change.price === null ? "Cena ukryta" : priceFormat.format(change.price)}
					</span>
					<PriceChangeText
						amount={change.changeAmount}
						percent={change.changePercent}
						stacked
						className="justify-self-start"
					/>
				</li>
			))}
		</ol>
	);
}
