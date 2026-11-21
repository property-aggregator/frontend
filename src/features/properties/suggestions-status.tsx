import { cn } from "@/lib/utils";

export const suggestionsPanel =
	"scroll-thin absolute top-full left-0 z-30 mt-1.5 max-h-80 w-full overflow-auto rounded border border-line bg-white shadow-lg";

/** In place of the location suggestions: placeholder rows while they load, then a note when there are none. */
export function SuggestionsStatus({ loading, emptyText }: { loading: boolean; emptyText: string }) {
	return (
		<div role="status" className={cn(suggestionsPanel, "py-1")}>
			{loading ? (
				<>
					<span className="sr-only">Wyszukiwanie lokalizacji…</span>
					{Array.from({ length: 3 }, (_, index) => (
						<span key={index} className="flex items-center gap-3 px-3.5 py-2" aria-hidden="true">
							<span className="size-[18px] shrink-0 animate-pulse rounded bg-mist" />
							<span className="flex-1 space-y-1.5">
								<span className="block h-3.5 w-2/5 animate-pulse rounded bg-mist" />
								<span className="block h-3 w-1/4 animate-pulse rounded bg-mist" />
							</span>
						</span>
					))}
				</>
			) : (
				<span className="block px-3.5 py-2 text-muted">{emptyText}</span>
			)}
		</div>
	);
}
