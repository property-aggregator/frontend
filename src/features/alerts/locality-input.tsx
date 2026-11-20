"use client";

import { MapPin } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/icon";
import type { LocationSuggestion, SearchLocation } from "@/features/properties/api";
import { LOCATION_QUERY_MAX_LENGTH, LOCATION_QUERY_MIN_LENGTH } from "@/features/properties/search-params";
import { SuggestionsStatus, suggestionsPanel } from "@/features/properties/suggestions-status";
import { cn } from "@/lib/utils";

export type PickedLocality = { locality: SearchLocation; district: SearchLocation | null };

type Row = { locality: LocationSuggestion; district?: SearchLocation };

const cache = new Map<string, LocationSuggestion[]>();

export function describeLocality({ locality, district }: PickedLocality): string {
	return district ? `${locality.name}: ${district.name}` : locality.label;
}

type LocalityInputProps = {
	labelId: string;
	initial: PickedLocality | null;
	onPick: (picked: PickedLocality | null) => void;
};

/**
 * One locality, or one of its districts; alerts take no other kind of place. Unlike the search,
 * places without offers are suggested too, so an alert can wait for the first one.
 */
export function LocalityInput({ labelId, initial, onPick }: LocalityInputProps) {
	const listId = useId();
	const [text, setText] = useState(initial ? describeLocality(initial) : "");
	const [picked, setPicked] = useState(initial);
	const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [active, setActive] = useState(-1);
	const pending = useRef<{ timeout?: ReturnType<typeof setTimeout>; controller?: AbortController }>({});

	const rows: Row[] = suggestions.flatMap((locality) => [
		{ locality },
		...locality.districts.map((district) => ({ locality, district })),
	]);
	const expanded = open && rows.length > 0;
	const empty = open && !loading && rows.length === 0 && !picked && text.trim().length >= LOCATION_QUERY_MIN_LENGTH;

	function show(items: LocationSuggestion[]) {
		setSuggestions(items.filter(({ type }) => type === "locality"));
		setActive(-1);
		setLoading(false);
		setOpen(true);
	}

	async function load(query: string, signal: AbortSignal) {
		try {
			const response = await fetch(`/api/locations/suggest?all=1&q=${encodeURIComponent(query)}`, { signal });
			const items: LocationSuggestion[] = response.ok ? await response.json() : [];
			if (response.ok) {
				cache.set(query, items);
			}
			show(items);
		} catch {
			if (!signal.aborted) {
				setSuggestions([]);
				setLoading(false);
			}
		}
	}

	function onChange(next: string) {
		setText(next);
		if (picked) {
			setPicked(null);
			onPick(null);
		}
		clearTimeout(pending.current.timeout);
		pending.current.controller?.abort();
		setLoading(false);

		const query = next.trim().toLowerCase();
		if (query.length < LOCATION_QUERY_MIN_LENGTH || query.length > LOCATION_QUERY_MAX_LENGTH) {
			setSuggestions([]);
			setOpen(false);
			return;
		}
		const cached = cache.get(query);
		if (cached) {
			show(cached);
			return;
		}
		const controller = new AbortController();
		setLoading(true);
		setOpen(true);
		pending.current = { controller, timeout: setTimeout(() => load(query, controller.signal), 120) };
	}

	function pick({ locality, district }: Row) {
		const next = { locality, district: district ?? null };
		setPicked(next);
		setText(describeLocality(next));
		setOpen(false);
		onPick(next);
	}

	function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (rows.length === 0) {
			return;
		}
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			setOpen(true);
			setActive(event.key === "ArrowDown" ? Math.min(active + 1, rows.length - 1) : Math.max(active - 1, 0));
		} else if (event.key === "Enter" && expanded && active >= 0) {
			event.preventDefault();
			pick(rows[active]);
		} else if (event.key === "Escape" && expanded) {
			event.preventDefault();
			setOpen(false);
		}
	}

	return (
		<span className="relative block">
			<input type="hidden" name="localityId" value={picked?.locality.id ?? ""} />
			<input type="hidden" name="districtId" value={picked?.district?.id ?? ""} />
			<Icon icon={MapPin} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xl text-muted" />
			<input
				value={text}
				onChange={(event) => onChange(event.target.value)}
				onKeyDown={onKeyDown}
				onFocus={(event) => {
					setOpen(true);
					if (picked) {
						event.target.select();
					}
				}}
				onBlur={() => setOpen(false)}
				placeholder="Miasto lub dzielnica"
				autoComplete="off"
				role="combobox"
				aria-autocomplete="list"
				aria-expanded={expanded}
				aria-controls={listId}
				aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
				aria-labelledby={labelId}
				className="field truncate pl-10"
			/>
			{(loading || empty) && open && rows.length === 0 && (
				<SuggestionsStatus loading={loading} emptyText="Nie znaleziono takiej miejscowości." />
			)}
			{expanded && (
				<ul id={listId} role="listbox" aria-labelledby={labelId} className={suggestionsPanel}>
					{rows.map((row, index) => (
						<li
							key={`${row.locality.id}-${row.district?.id ?? ""}`}
							id={`${listId}-${index}`}
							role="option"
							aria-selected={index === active}
							// Keeps the focus in the input, so its blur does not close the list before the click.
							onPointerDown={(event) => event.preventDefault()}
							onClick={() => pick(row)}
							onPointerMove={() => setActive(index)}
							className={cn(
								"cursor-pointer py-2 pr-3.5 text-ink",
								row.district ? "pl-10" : "pl-3.5",
								index === active && "bg-mist",
							)}
						>
							{row.district ? (
								row.district.name
							) : (
								<span className="font-medium">{row.locality.label}</span>
							)}
						</li>
					))}
				</ul>
			)}
		</span>
	);
}
