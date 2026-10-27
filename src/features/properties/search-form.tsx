"use client";

import { ArrowUpDown, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, type FormEvent } from "react";
import { Chevron, Dropdown, type DropdownOption } from "@/components/dropdown";
import { Icon } from "@/components/icon";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
	marketLabels,
	propertyTypeLabels,
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
			if (typeof value === "string" && value.trim() !== "") {
				params.set(key, value.trim());
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
					<Select
						labelId={labelId}
						name="status"
						options={statusLabels}
						placeholder="Wszystkie"
						value="active"
					/>
				)}
			</Field>
			<Field label="Sortowanie">
				{(labelId) => <Select labelId={labelId} name="sort" options={sortLabels} placeholder="Domyślne" />}
			</Field>
			<button type="submit" className="btn btn-slate self-end md:col-span-2">
				<Icon icon={Search} className="text-[18px]" />
				Szukaj
			</button>
		</form>
	);
}

export function FiltersForm({ filters }: { filters: SearchFilters }) {
	const onSubmit = useSubmitSearch();

	return (
		<form action={routes.search} onSubmit={onSubmit} className="grid grid-cols-2 gap-x-3 gap-y-4">
			{filters.sort && <input type="hidden" name="sort" value={filters.sort} />}
			<Field label="Lokalizacja" className="col-span-2">
				{(labelId) => <LocationInput labelId={labelId} value={filters.location} />}
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
				{(labelId) => (
					<Select
						labelId={labelId}
						name="status"
						options={statusLabels}
						placeholder="Wszystkie"
						value={filters.status}
					/>
				)}
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
				options={toOptions(sortLabels, "Domyślnie")}
				defaultValue={filters.sort}
				onChange={(value) => {
					const sort = (value || undefined) as SearchFilters["sort"];
					router.push(`${routes.search}?${toSearchParams({ ...filters, sort, page: undefined })}`);
				}}
				trigger={(selectedLabel, open) => (
					<>
						<span className="flex items-center gap-1.5 text-[15px] lg:hidden">
							<Icon icon={ArrowUpDown} className="text-[18px]" />
							Sortowanie
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

function LocationInput({ labelId, value }: { labelId: string; value?: string }) {
	return (
		<span className="relative block">
			<Icon icon={MapPin} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[18px] text-muted" />
			<input
				name="location"
				defaultValue={value}
				placeholder="Miasto, dzielnica lub ulica"
				aria-labelledby={labelId}
				className="field pl-10"
			/>
		</span>
	);
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

function toOptions(labels: Record<string, string>, placeholder: string): DropdownOption[] {
	return [{ value: "", label: placeholder }, ...Object.entries(labels).map(([value, label]) => ({ value, label }))];
}

type SelectProps = {
	labelId: string;
	name: string;
	options: Record<string, string>;
	placeholder: string;
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
