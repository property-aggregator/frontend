"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { Dropdown, type DropdownOption } from "@/components/dropdown";
import { Icon } from "@/components/icon";
import { Switch } from "@/components/switch";
import { marketLabels, propertyTypeLabels, transactionLabels } from "@/features/properties/search-params";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { saveAlert } from "./actions";
import { alertLocation, defaultAlertName, frequencyLabels } from "./alert-format";
import type { NotificationFrequency, SearchAlert, SearchAlertRequest } from "./api";
import { useContacts } from "./contacts";
import { LocalityInput, type PickedLocality } from "./locality-input";

type AlertFormProps = {
	/** Edited; a new alert without it. */
	alert?: SearchAlert;
	smsAvailable: boolean;
	onSaved: (alert: SearchAlert) => void;
	onCancel: () => void;
};

export function AlertForm({ alert, smsAvailable, onSaved, onCancel }: AlertFormProps) {
	const [location, setLocation] = useState<PickedLocality | null>(
		alert ? { locality: alert.locality, district: alert.district } : null,
	);
	const { hasEmail, hasPhone } = useContacts();
	// A new alert starts with both channels on, as the API's own default; but only those with a contact to go to,
	// and SMS only when the plan has it.
	const [emailEnabled, setEmailEnabled] = useState(alert?.emailEnabled ?? hasEmail);
	const [smsEnabled, setSmsEnabled] = useState(smsAvailable && (alert?.smsEnabled ?? hasPhone));
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();
	const titleId = useId();
	const fullScreen = useFullScreen(onCancel);

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!location) {
			setError("Wybierz lokalizację z listy podpowiedzi.");
			return;
		}

		const data = new FormData(event.currentTarget);
		const text = (key: string) => String(data.get(key) ?? "").trim();
		const number = (key: string) => (text(key) === "" ? null : Number(text(key)));
		// The dropdowns only offer the enum values, or "" for any.
		const option = (key: string) => (text(key) || null) as never;
		const time = (key: string) => (text(key) ? `${text(key).slice(0, 5)}:00` : null);

		const criteria = { propertyType: option("propertyType"), priceMax: number("priceMax") };
		const request: SearchAlertRequest = {
			name: text("name") || defaultAlertName(criteria, alertLocation(location)),
			...criteria,
			transactionType: option("transactionType"),
			marketType: option("marketType"),
			priceMin: number("priceMin"),
			areaMin: number("areaMin"),
			areaMax: number("areaMax"),
			roomsMin: number("roomsMin"),
			roomsMax: number("roomsMax"),
			localityId: location.locality.id,
			districtId: location.district?.id ?? null,
			emailEnabled,
			smsEnabled,
			notificationFrequency: text("notificationFrequency") as NotificationFrequency,
			quietHoursStart: time("quietHoursStart"),
			quietHoursEnd: time("quietHoursEnd"),
		};

		setError(null);
		startTransition(async () => {
			const result = await saveAlert(alert?.id ?? null, request);
			startTransition(() => {
				if (result.alert) {
					onSaved(result.alert);
				} else {
					setError(result.error ?? "Nie udało się zapisać alertu.");
				}
			});
		});
	}

	return (
		// Full screen below lg, as the filters of the search; in place on large screens.
		<form
			onSubmit={onSubmit}
			role={fullScreen ? "dialog" : undefined}
			aria-modal={fullScreen || undefined}
			aria-labelledby={titleId}
			className="grid content-start gap-x-3 gap-y-4 rounded-lg border border-line bg-white p-5 max-lg:fixed max-lg:inset-0 max-lg:z-[60] max-lg:overflow-y-auto max-lg:rounded-none max-lg:border-0 max-lg:pb-0 sm:grid-cols-2 md:p-6"
		>
			<div className="flex items-center justify-between gap-3 sm:col-span-2">
				<h2 id={titleId} className="head text-xl font-semibold">
					{alert ? "Edytuj alert" : "Nowy alert"}
				</h2>
				<button
					type="button"
					onClick={onCancel}
					className="-mr-2 grid h-10 w-10 cursor-pointer place-items-center rounded-md text-ink lg:hidden"
					aria-label="Zamknij"
				>
					<Icon icon={X} />
				</button>
			</div>
			<Field label="Lokalizacja" className="sm:col-span-2">
				{(labelId) => <LocalityInput labelId={labelId} initial={location} onPick={setLocation} />}
			</Field>
			<Field label="Transakcja">
				{(labelId) => (
					<Select
						labelId={labelId}
						name="transactionType"
						options={transactionLabels}
						placeholder="Dowolna"
						value={alert?.transactionType}
					/>
				)}
			</Field>
			<Field label="Rodzaj">
				{(labelId) => (
					<Select
						labelId={labelId}
						name="propertyType"
						options={propertyTypeLabels}
						placeholder="Dowolny"
						value={alert?.propertyType}
					/>
				)}
			</Field>
			<Field label="Rynek">
				{(labelId) => (
					<Select
						labelId={labelId}
						name="marketType"
						options={marketLabels}
						placeholder="Dowolny"
						value={alert?.marketType}
					/>
				)}
			</Field>
			<Field label="Częstotliwość">
				{(labelId) => (
					<Select
						labelId={labelId}
						name="notificationFrequency"
						options={frequencyLabels}
						value={alert?.notificationFrequency ?? "instant"}
					/>
				)}
			</Field>
			<Range label="Cena (zł)" name="price" min={alert?.priceMin} max={alert?.priceMax} />
			<Range label="Powierzchnia (m²)" name="area" min={alert?.areaMin} max={alert?.areaMax} />
			<Range label="Liczba pokoi" name="rooms" min={alert?.roomsMin} max={alert?.roomsMax} step={1} />
			<fieldset className="grid content-start gap-1.5 sm:col-span-2">
				<legend className="head mb-1.5 text-sm font-medium">Cisza nocna (opcjonalnie)</legend>
				<div className="grid grid-cols-2 gap-3">
					<input
						type="time"
						name="quietHoursStart"
						defaultValue={alert?.quietHoursStart?.slice(0, 5)}
						aria-label="Cisza nocna od"
						className="field"
					/>
					<input
						type="time"
						name="quietHoursEnd"
						defaultValue={alert?.quietHoursEnd?.slice(0, 5)}
						aria-label="Cisza nocna do"
						className="field"
					/>
				</div>
			</fieldset>
			<Field label="Nazwa (opcjonalnie)" className="sm:col-span-2">
				{(labelId) => (
					<input
						name="name"
						defaultValue={alert?.name}
						maxLength={100}
						placeholder="Gdy puste, powstanie z kryteriów"
						aria-labelledby={labelId}
						className="field"
					/>
				)}
			</Field>
			<div className="grid gap-3 border-t border-line pt-4 sm:col-span-2">
				<ChannelSwitch
					label="Powiadomienia e-mail"
					checked={emailEnabled}
					onChange={setEmailEnabled}
					missing={hasEmail ? undefined : "Najpierw podaj e-mail w danych kontaktowych."}
				/>
				<ChannelSwitch
					label="Powiadomienia SMS"
					checked={smsEnabled}
					onChange={setSmsEnabled}
					locked={!smsAvailable}
					missing={hasPhone ? undefined : "Najpierw podaj numer telefonu w danych kontaktowych."}
				/>
			</div>
			{error && (
				<p role="alert" className="text-sm font-semibold text-ink sm:col-span-2">
					{error}
				</p>
			)}
			<div className="mt-1 flex gap-2 max-lg:sticky max-lg:bottom-0 max-lg:-mx-5 max-lg:border-t max-lg:border-line max-lg:bg-white max-lg:px-5 max-lg:py-3 sm:col-span-2 md:max-lg:-mx-6 md:max-lg:px-6">
				<button type="submit" disabled={pending} className="btn btn-sm btn-primary flex-1 disabled:opacity-50">
					{alert ? "Zapisz zmiany" : "Utwórz alert"}
				</button>
				<button type="button" onClick={onCancel} className="btn btn-sm btn-soft">
					Anuluj
				</button>
			</div>
		</form>
	);
}

/** Below lg, where the form covers the screen: the page behind stops scrolling, and Escape closes it. */
function useFullScreen(onClose: () => void): boolean {
	const [fullScreen, setFullScreen] = useState(false);
	// A ref, as the parent passes a new function on every render.
	const close = useRef(onClose);
	useEffect(() => {
		close.current = onClose;
	});

	useEffect(() => {
		const query = window.matchMedia("(width < 64rem)");
		const update = () => setFullScreen(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	useEffect(() => {
		if (!fullScreen) {
			return;
		}
		const overflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && close.current();
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.body.style.overflow = overflow;
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [fullScreen]);

	return fullScreen;
}

type ChannelSwitchProps = {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	/** Not in the plan: the switch stays off, with a link to the plans. */
	locked?: boolean;
	/** Says which contact is missing; until it is added, the switch can be turned off but not on. */
	missing?: string;
};

function ChannelSwitch({ label, checked, onChange, locked, missing }: ChannelSwitchProps) {
	const labelId = useId();
	const hintId = useId();

	return (
		<div className="flex items-center justify-between gap-4">
			<span>
				<span id={labelId} className={cn("flex items-center gap-1.5", locked ? "text-muted" : "text-ink")}>
					{label}
					{locked && (
						<Link href={routes.premium} className="text-sm font-semibold text-ink hover:text-primary">
							w Premium
						</Link>
					)}
				</span>
				{!locked && missing && (
					<span id={hintId} className="block text-sm text-muted">
						{missing}
					</span>
				)}
			</span>
			<Switch
				checked={checked}
				onChange={onChange}
				labelledBy={labelId}
				describedBy={!locked && missing ? hintId : undefined}
				disabled={locked || (Boolean(missing) && !checked)}
				size="sm"
			/>
		</div>
	);
}

type FieldProps = { label: string; className?: string; children: (labelId: string) => React.ReactNode };

function Field({ label, className, children }: FieldProps) {
	const labelId = useId();

	return (
		<div className={cn("grid content-start gap-1.5", className)}>
			<span id={labelId} className="head text-sm font-medium">
				{label}
			</span>
			{children(labelId)}
		</div>
	);
}

type SelectProps = {
	labelId: string;
	name: string;
	options: Record<string, string>;
	placeholder?: string;
	value?: string | null;
};

function Select({ labelId, name, options, placeholder, value }: SelectProps) {
	const choices: DropdownOption[] = Object.entries(options).map(([key, label]) => ({ value: key, label }));
	return (
		<Dropdown
			labelId={labelId}
			name={name}
			options={placeholder === undefined ? choices : [{ value: "", label: placeholder }, ...choices]}
			defaultValue={value ?? ""}
		/>
	);
}

type RangeProps = { label: string; name: string; min?: number | null; max?: number | null; step?: number };

function Range({ label, name, min, max, step }: RangeProps) {
	return (
		<fieldset className="grid content-start gap-1.5 sm:col-span-2">
			<legend className="head mb-1.5 text-sm font-medium">{label}</legend>
			<div className="grid grid-cols-2 gap-3">
				<input
					type="number"
					name={`${name}Min`}
					defaultValue={min ?? undefined}
					min={0}
					step={step ?? "any"}
					placeholder="od"
					aria-label={`${label} od`}
					className="field"
				/>
				<input
					type="number"
					name={`${name}Max`}
					defaultValue={max ?? undefined}
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
