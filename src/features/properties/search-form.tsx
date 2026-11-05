"use client";

import { ArrowUpDown, Check, MapPin, Minus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Chevron, Dropdown, type DropdownOption } from "@/components/dropdown";
import { Icon } from "@/components/icon";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { LocationSuggestion, SearchLocation } from "./api";
import {
	LOCATION_QUERY_MAX_LENGTH,
	LOCATION_QUERY_MIN_LENGTH,
	MAX_DISTRICTS,
	locationTypeLabels,
	marketLabels,
	propertyTypeLabels,
	radiusOptions,
	defaultFilters,
	isDefaultFilter,
	sortLabels,
	statusLabels,
	toSearchParams,
	transactionLabels,
	type SearchFilters,
} from "./search-params";

function useSubmitSearch() {
	const router = useRouter();

	// Without JS the form still works as a plain GET; this only drops the empty fields from the URL.
	return (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const params = new URLSearchParams();
		for (const [key, value] of new FormData(event.currentTarget)) {
			if (typeof value === "string" && value.trim() !== "" && !isDefaultFilter(key, value)) {
				params.append(key, value.trim());
			}
		}
		router.push(`${routes.search}?${params}`);
	};
}

export function HeroSearchForm() {
	const onSubmit = useSubmitSearch();

	return (
		<form
			action={routes.search}
			onSubmit={onSubmit}
			className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:rounded-xl lg:bg-white lg:p-6 lg:shadow-sm"
		>
			<Field label="Lokalizacja" className="md:col-span-2">
				{(labelId) => <LocationInput labelId={labelId} />}
			</Field>
			<Field label="Transakcja">
				{(labelId) => (
					<Select
						labelId={labelId}
						name="transaction"
						options={transactionLabels}
						placeholder="Kupno lub wynajem"
					/>
				)}
			</Field>
			<Field label="Rodzaj nieruchomości">
				{(labelId) => (
					<Select labelId={labelId} name="type" options={propertyTypeLabels} placeholder="Każdy rodzaj" />
				)}
			</Field>
			<Range label="Cena (zł)" name="Price" />
			<Range label="Powierzchnia (m²)" name="Area" />
			<Range label="Liczba pokoi" name="Rooms" step={1} />
			<Field label="Rynek">
				{(labelId) => <Select labelId={labelId} name="market" options={marketLabels} placeholder="Dowolny" />}
			</Field>
			<Field label="Status oferty">
				{(labelId) => (
					<Select labelId={labelId} name="status" options={statusLabels} value={defaultFilters.status} />
				)}
			</Field>
			<Field label="Sortowanie">
				{(labelId) => <Select labelId={labelId} name="sort" options={sortLabels} value={defaultFilters.sort} />}
			</Field>
			<button type="submit" className="btn btn-slate self-end md:col-span-2">
				<Icon icon={Search} className="text-[18px]" />
				Szukaj
			</button>
		</form>
	);
}

type FiltersFormProps = { filters: SearchFilters; location?: LocationSuggestion };

export function FiltersForm({ filters, location }: FiltersFormProps) {
	const onSubmit = useSubmitSearch();

	return (
		<form action={routes.search} onSubmit={onSubmit} className="grid grid-cols-2 gap-x-3 gap-y-4">
			{filters.sort && <input type="hidden" name="sort" value={filters.sort} />}
			<Field label="Lokalizacja" className="col-span-2">
				{(labelId) => (
					<LocationInput
						labelId={labelId}
						selection={location}
						selectedDistricts={filters.district}
						radius={filters.radius}
					/>
				)}
			</Field>
			<Field label="Transakcja">
				{(labelId) => (
					<Select
						labelId={labelId}
						name="transaction"
						options={transactionLabels}
						placeholder="Dowolna"
						value={filters.transaction}
					/>
				)}
			</Field>
			<Field label="Rodzaj">
				{(labelId) => (
					<Select
						labelId={labelId}
						name="type"
						options={propertyTypeLabels}
						placeholder="Dowolny"
						value={filters.type}
					/>
				)}
			</Field>
			<Field label="Rynek">
				{(labelId) => (
					<Select
						labelId={labelId}
						name="market"
						options={marketLabels}
						placeholder="Dowolny"
						value={filters.market}
					/>
				)}
			</Field>
			<Field label="Status oferty">
				{(labelId) => <Select labelId={labelId} name="status" options={statusLabels} value={filters.status} />}
			</Field>
			<Range
				label="Cena (zł)"
				name="Price"
				min={filters.minPrice}
				max={filters.maxPrice}
				className="col-span-2"
			/>
			<Range
				label="Powierzchnia (m²)"
				name="Area"
				min={filters.minArea}
				max={filters.maxArea}
				className="col-span-2"
			/>
			<Range
				label="Liczba pokoi"
				name="Rooms"
				min={filters.minRooms}
				max={filters.maxRooms}
				step={1}
				className="col-span-2"
			/>
			<div className="col-span-2 mt-1 flex gap-2">
				<button type="submit" className="btn btn-sm btn-slate flex-1">
					Zastosuj
				</button>
				<Link href={routes.search} className="btn btn-sm btn-soft">
					Wyczyść
				</Link>
			</div>
		</form>
	);
}

export function SortSelect({ filters }: { filters: SearchFilters }) {
	const router = useRouter();
	const labelId = useId();

	return (
		<div className="flex shrink-0 items-center gap-2 text-[13px]">
			<span id={labelId} className="hidden text-body lg:inline">
				Sortuj:
			</span>
			<Dropdown
				labelId={labelId}
				variant="inline"
				align="right"
				options={toOptions(sortLabels)}
				defaultValue={filters.sort}
				onChange={(value) => {
					const sort = value as SearchFilters["sort"];
					router.push(`${routes.search}?${toSearchParams({ ...filters, sort, page: undefined })}`);
				}}
				trigger={(selectedLabel, open) => (
					<>
						<span className="flex items-center gap-1.5 text-[15px] lg:hidden">
							<Icon icon={ArrowUpDown} className="text-[18px]" />
							{selectedLabel}
						</span>
						<span className="hidden items-center gap-2 lg:flex">
							{selectedLabel}
							<Chevron open={open} />
						</span>
					</>
				)}
			/>
		</div>
	);
}

// Shared by the forms for the whole visit: going back a letter or retyping a query shows its suggestions at once.
const suggestionCache = new Map<string, LocationSuggestion[]>();

type LocationInputProps = {
	labelId: string;
	selection?: LocationSuggestion;
	selectedDistricts?: string[];
	radius?: number;
};

type Row = { suggestion: LocationSuggestion; district?: SearchLocation };

/** Only a picked suggestion is searched for; text typed without picking one is ignored. */
function LocationInput({ labelId, selection, selectedDistricts = [], radius }: LocationInputProps) {
	const listId = useId();
	const radiusLabelId = useId();
	const [text, setText] = useState(selection ? describe(selection, selectedDistricts) : "");
	const [picked, setPicked] = useState(selection);
	const [checked, setChecked] = useState(selectedDistricts);
	const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(-1);
	const pending = useRef<{ timeout?: ReturnType<typeof setTimeout>; controller?: AbortController }>({});

	// Back in the field after picking a locality, its districts can still be changed.
	const shown = suggestions.length > 0 ? suggestions : picked?.districts.length ? [picked] : [];
	const rows: Row[] = shown.flatMap((suggestion) => [
		{ suggestion },
		...suggestion.districts.map((district) => ({ suggestion, district })),
	]);
	const expanded = open && rows.length > 0;

	function cancelPending() {
		clearTimeout(pending.current.timeout);
		pending.current.controller?.abort();
	}

	function showSuggestions(items: LocationSuggestion[]) {
		setSuggestions(items);
		setActive(-1);
		setOpen(items.length > 0);
	}

	async function loadSuggestions(query: string, signal: AbortSignal) {
		try {
			const response = await fetch(`/api/locations/suggest?q=${encodeURIComponent(query)}`, { signal });
			const items: LocationSuggestion[] = response.ok ? await response.json() : [];
			if (response.ok) {
				suggestionCache.set(query, items);
			}
			showSuggestions(items);
		} catch {
			if (!signal.aborted) {
				setSuggestions([]);
			}
		}
	}

	function onChange(next: string) {
		setText(next);
		setPicked(undefined);
		setChecked([]);
		cancelPending();

		const query = next.trim().toLowerCase();
		if (query.length < LOCATION_QUERY_MIN_LENGTH || query.length > LOCATION_QUERY_MAX_LENGTH) {
			setSuggestions([]);
			setOpen(false);
			return;
		}
		const cached = suggestionCache.get(query);
		if (cached) {
			showSuggestions(cached);
			return;
		}
		const controller = new AbortController();
		pending.current = { controller, timeout: setTimeout(() => loadSuggestions(query, controller.signal), 120) };
	}

	function select(location: LocationSuggestion | undefined, districtIds: string[]) {
		cancelPending();
		setPicked(location);
		setChecked(districtIds);
		setText(location ? describe(location, districtIds) : "");
	}

	function isChecked({ suggestion, district }: Row): boolean {
		if (picked?.id !== suggestion.id) {
			return false;
		}
		return district ? checked.includes(district.id) : checked.length === 0;
	}

	function toggle(row: Row) {
		const { suggestion, district } = row;
		if (!district) {
			select(isChecked(row) ? undefined : suggestion, []);
			if (suggestion.districts.length === 0) {
				setOpen(false);
			}
			return;
		}

		// Districts of another locality are replaced, not added to.
		const current = picked?.id === suggestion.id ? checked : [];
		if (current.includes(district.id)) {
			select(
				suggestion,
				current.filter((id) => id !== district.id),
			);
		} else if (current.length < MAX_DISTRICTS) {
			select(suggestion, [...current, district.id]);
		}
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
			toggle(rows[active]);
		} else if (event.key === "Escape" && expanded) {
			event.preventDefault();
			setOpen(false);
		}
	}

	return (
		<div className="flex gap-2">
			<span className="relative block min-w-0 flex-1">
				<input type="hidden" name="locationId" value={picked?.id ?? ""} />
				{checked.map((id) => (
					<input key={id} type="hidden" name="district" value={id} />
				))}
				<Icon icon={MapPin} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[18px] text-muted" />
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
					placeholder="Miasto, dzielnica lub gmina"
					autoComplete="off"
					role="combobox"
					aria-autocomplete="list"
					aria-expanded={expanded}
					aria-controls={listId}
					aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
					aria-labelledby={labelId}
					className="field truncate pl-10"
				/>
				{expanded && (
					<ul
						id={listId}
						role="listbox"
						aria-multiselectable="true"
						aria-labelledby={labelId}
						className="scroll-thin absolute top-full left-0 z-30 mt-1.5 max-h-80 w-full overflow-auto rounded-lg border border-line bg-white shadow-lg"
					>
						{rows.map((row, index) => {
							const { suggestion, district } = row;
							const location = district ?? suggestion;
							const selected = isChecked(row);
							const partly = !district && picked?.id === suggestion.id && checked.length > 0;
							return (
								<li
									key={`${suggestion.id}-${district?.id ?? ""}`}
									id={`${listId}-${index}`}
									role="option"
									aria-selected={selected}
									// Keeps the focus in the input, so its blur does not close the list before the click.
									onPointerDown={(event) => event.preventDefault()}
									onClick={() => toggle(row)}
									onPointerMove={() => setActive(index)}
									className={cn(
										"flex cursor-pointer items-center gap-3 py-2 pr-3.5 text-ink",
										district ? "pl-10" : "pl-3.5",
										index === active && "bg-mist",
									)}
								>
									<span
										className={cn(
											"grid h-[18px] w-[18px] shrink-0 place-items-center rounded border",
											selected || partly
												? "border-slate bg-slate text-white"
												: "border-line bg-white",
										)}
									>
										{(selected || partly) && (
											<Icon icon={partly ? Minus : Check} className="text-[14px]" />
										)}
									</span>
									<span className="min-w-0 flex-1">
										<span className={cn("block truncate", !district && "font-medium")}>
											{district ? district.name : suggestion.label}
										</span>
										{!district && (
											<span className="block text-[12px] text-muted">
												{locationTypeLabels[suggestion.type]}
											</span>
										)}
									</span>
									<span className="shrink-0 text-[12px] text-muted tabular-nums">
										{location.offerCount.toLocaleString("pl-PL")}
									</span>
								</li>
							);
						})}
					</ul>
				)}
			</span>
			{/* Voivodeships, counties and municipalities are too large for a radius to make sense. */}
			{picked?.type === "locality" && (
				<div className="w-[104px] shrink-0">
					<span id={radiusLabelId} className="sr-only">
						Promień
					</span>
					<Dropdown
						// Another locality starts without a radius.
						key={picked.id}
						labelId={radiusLabelId}
						name="radius"
						align="right"
						options={[
							{ value: "", label: "+0 km" },
							...radiusOptions.map((km) => ({ value: String(km), label: `+${km} km` })),
						]}
						defaultValue={picked.id === selection?.id && radius ? String(radius) : ""}
					/>
				</div>
			)}
		</div>
	);
}

/** E.g. "Warszawa, mazowieckie", or "Warszawa: Mokotów, Wola" with districts picked. */
function describe(location: LocationSuggestion, districtIds: string[]): string {
	const names = location.districts.filter(({ id }) => districtIds.includes(id)).map(({ name }) => name);
	return names.length > 0 ? `${location.name}: ${names.join(", ")}` : location.label;
}

type FieldProps = { label: string; className?: string; children: (labelId: string) => React.ReactNode };

function Field({ label, className, children }: FieldProps) {
	const labelId = useId();

	return (
		<div className={cn("grid content-start gap-1.5", className)}>
			<span id={labelId} className="head text-[13px] font-medium">
				{label}
			</span>
			{children(labelId)}
		</div>
	);
}

function toOptions(labels: Record<string, string>, placeholder?: string): DropdownOption[] {
	const options = Object.entries(labels).map(([value, label]) => ({ value, label }));
	return placeholder === undefined ? options : [{ value: "", label: placeholder }, ...options];
}

type SelectProps = {
	labelId: string;
	name: string;
	options: Record<string, string>;
	placeholder?: string;
	value?: string;
};

function Select({ labelId, name, options, placeholder, value }: SelectProps) {
	return <Dropdown labelId={labelId} name={name} options={toOptions(options, placeholder)} defaultValue={value} />;
}

type RangeProps = { label: string; name: string; min?: number; max?: number; step?: number; className?: string };

function Range({ label, name, min, max, step, className }: RangeProps) {
	return (
		<fieldset className={cn("grid content-start gap-1.5", className)}>
			<legend className="head mb-1.5 text-[13px] font-medium">{label}</legend>
			<div className="grid grid-cols-2 gap-3">
				<input
					type="number"
					name={`min${name}`}
					defaultValue={min}
					min={0}
					step={step ?? "any"}
					placeholder="od"
					aria-label={`${label} od`}
					className="field"
				/>
				<input
					type="number"
					name={`max${name}`}
					defaultValue={max}
					min={0}
					step={step ?? "any"}
					placeholder="do"
					aria-label={`${label} do`}
					className="field"
				/>
			</div>
		</fieldset>
	);
}
