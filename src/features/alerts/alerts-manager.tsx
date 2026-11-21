"use client";

import { BellRing, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useId, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Icon } from "@/components/icon";
import { Switch } from "@/components/switch";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { removeAlert, saveAlert, setAlertActive } from "./actions";
import { alertCriteria, alertHeadline, frequencyLabels } from "./alert-format";
import { AlertForm } from "./alert-form";
import type { SearchAlert, SearchAlertRequest } from "./api";
import { useContacts } from "./contacts";

type AlertsManagerProps = {
	initialAlerts: SearchAlert[];
	activeAlertsLimit: number;
	smsAvailable: boolean;
};

/** "new" while adding, an alert id while editing it. */
type Editing = "new" | string | null;

export function AlertsManager({ initialAlerts, activeAlertsLimit, smsAvailable }: AlertsManagerProps) {
	const [alerts, setAlerts] = useState(initialAlerts);
	const [editing, setEditing] = useState<Editing>(null);
	const activeCount = alerts.filter((alert) => alert.isActive).length;
	const limitReached = activeCount >= activeAlertsLimit;

	function replace(updated: SearchAlert) {
		setAlerts((current) => current.map((alert) => (alert.id === updated.id ? updated : alert)));
	}

	function onSaved(saved: SearchAlert) {
		setAlerts((current) =>
			current.some((alert) => alert.id === saved.id)
				? current.map((alert) => (alert.id === saved.id ? saved : alert))
				: [saved, ...current],
		);
		setEditing(null);
	}

	return (
		<div className="grid gap-4">
			{editing === "new" ? (
				<AlertForm smsAvailable={smsAvailable} onSaved={onSaved} onCancel={() => setEditing(null)} />
			) : activeAlertsLimit === 0 ? (
				<p className="rounded-xl border border-dashed border-line p-6 text-center">
					Alerty są dostępne w planach Premium.{" "}
					<Link href={routes.premium} className="font-semibold text-ink hover:text-slate">
						Zobacz plany
					</Link>
				</p>
			) : limitReached ? (
				<p className="rounded-xl border border-dashed border-line p-6 text-center">
					Masz już {activeAlertsLimit} z {activeAlertsLimit} aktywnych alertów. Wyłącz któryś, aby dodać nowy,
					albo{" "}
					<Link href={routes.premium} className="font-semibold text-ink hover:text-slate">
						wybierz wyższy plan
					</Link>
					.
				</p>
			) : (
				<button
					type="button"
					onClick={() => setEditing("new")}
					className="head flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate p-6 font-semibold text-slate transition-colors hover:bg-white"
				>
					<Icon icon={Plus} className="text-xl" />
					Dodaj alert
				</button>
			)}
			{activeAlertsLimit > 0 && alerts.length > 0 && (
				<p className="text-sm text-muted">
					Aktywne alerty:{" "}
					<span className="font-semibold text-ink">
						{activeCount} z {activeAlertsLimit}
					</span>
				</p>
			)}
			{alerts.length === 0 && editing !== "new" && (
				<p className="rounded-xl bg-white p-8 text-center">
					Nie masz jeszcze alertów. Dodaj pierwszy, a powiadomimy Cię o nowych ofertach spełniających Twoje
					kryteria.
				</p>
			)}
			{alerts.map((alert) =>
				editing === alert.id ? (
					<AlertForm
						key={alert.id}
						alert={alert}
						smsAvailable={smsAvailable}
						onSaved={onSaved}
						onCancel={() => setEditing(null)}
					/>
				) : (
					<AlertCard
						key={alert.id}
						alert={alert}
						smsAvailable={smsAvailable}
						onChange={replace}
						onEdit={() => setEditing(alert.id)}
						onRemoved={() => setAlerts((current) => current.filter(({ id }) => id !== alert.id))}
					/>
				),
			)}
		</div>
	);
}

function toRequest(alert: SearchAlert): SearchAlertRequest {
	return {
		name: alert.name,
		propertyType: alert.propertyType,
		transactionType: alert.transactionType,
		marketType: alert.marketType,
		priceMin: alert.priceMin,
		priceMax: alert.priceMax,
		areaMin: alert.areaMin,
		areaMax: alert.areaMax,
		roomsMin: alert.roomsMin,
		roomsMax: alert.roomsMax,
		localityId: alert.locality.id,
		districtId: alert.district?.id ?? null,
		emailEnabled: alert.emailEnabled,
		smsEnabled: alert.smsEnabled,
		notificationFrequency: alert.notificationFrequency,
		quietHoursStart: alert.quietHoursStart,
		quietHoursEnd: alert.quietHoursEnd,
	};
}

type AlertCardProps = {
	alert: SearchAlert;
	smsAvailable: boolean;
	onChange: (alert: SearchAlert) => void;
	onEdit: () => void;
	onRemoved: () => void;
};

function AlertCard({ alert, smsAvailable, onChange, onEdit, onRemoved }: AlertCardProps) {
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const [confirmingRemoval, setConfirmingRemoval] = useState(false);
	const { hasEmail, hasPhone } = useContacts();
	const criteria = alertCriteria(alert);
	const smsOn = smsAvailable && alert.smsEnabled;
	const missing = [
		alert.isActive && alert.emailEnabled && !hasEmail && "e-mail",
		alert.isActive && smsOn && !hasPhone && "numer telefonu",
	].filter(Boolean);

	function run(action: () => Promise<{ alert?: SearchAlert; error?: string }>, onDone?: () => void) {
		setError(null);
		startTransition(async () => {
			const result = await action();
			startTransition(() => {
				if (result.error) {
					setConfirmingRemoval(false);
					setError(result.error);
				} else if (result.alert) {
					onChange(result.alert);
				} else {
					onDone?.();
				}
			});
		});
	}

	const setChannel = (channel: "emailEnabled" | "smsEnabled") => (enabled: boolean) =>
		run(() => saveAlert(alert.id, { ...toRequest(alert), [channel]: enabled }));

	return (
		<article className="rounded-xl bg-white p-5">
			<div className={cn("flex items-start gap-3", !alert.isActive && "opacity-60")}>
				<Icon icon={BellRing} className="mt-0.5 text-2xl text-slate" />
				<div className="min-w-0">
					<h3 className="text-lg leading-snug font-semibold">{alert.name}</h3>
					<p className="mt-0.5 font-semibold text-ink">{alertHeadline(alert)}</p>
					<p className="text-sm text-muted">
						{[criteria, `powiadomienia: ${frequencyLabels[alert.notificationFrequency].toLowerCase()}`]
							.filter(Boolean)
							.join(" • ")}
					</p>
				</div>
			</div>
			<div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-4">
				<LabeledSwitch
					label="Aktywny"
					checked={alert.isActive}
					disabled={pending}
					onChange={(isActive) => run(() => setAlertActive(alert.id, isActive))}
				/>
				<LabeledSwitch
					label="E-mail"
					checked={alert.emailEnabled}
					// Without an e-mail it can be turned off, but not on.
					disabled={pending || (!hasEmail && !alert.emailEnabled)}
					onChange={setChannel("emailEnabled")}
				/>
				<LabeledSwitch
					label="SMS"
					checked={smsOn}
					disabled={pending || !smsAvailable || (!hasPhone && !smsOn)}
					locked={!smsAvailable}
					onChange={setChannel("smsEnabled")}
				/>
				<div className="ml-auto flex items-center gap-1">
					<IconButton icon={Pencil} label="Edytuj alert" onClick={onEdit} />
					<IconButton icon={Trash2} label="Usuń alert" onClick={() => setConfirmingRemoval(true)} />
				</div>
			</div>
			<ConfirmDialog
				open={confirmingRemoval}
				title="Usunąć alert?"
				message={`„${alert.name}” przestanie wysyłać powiadomienia. Tej operacji nie można cofnąć.`}
				confirmLabel="Tak, usuń"
				pending={pending}
				onConfirm={() => run(() => removeAlert(alert.id), onRemoved)}
				onCancel={() => setConfirmingRemoval(false)}
			/>
			{missing.length > 0 && (
				<p className="mt-3 text-sm text-muted">
					Podaj {missing.join(" i ")} w danych kontaktowych, inaczej powiadomienia nie dotrą.
				</p>
			)}
			{error && (
				<p role="alert" className="mt-3 text-sm font-semibold text-ink">
					{error}
				</p>
			)}
		</article>
	);
}

type LabeledSwitchProps = {
	label: string;
	checked: boolean;
	disabled?: boolean;
	locked?: boolean;
	onChange: (checked: boolean) => void;
};

function LabeledSwitch({ label, checked, disabled, locked, onChange }: LabeledSwitchProps) {
	const labelId = useId();

	return (
		<span className="flex items-center gap-2" title={locked ? "SMS dostępne w planach Premium" : undefined}>
			<Switch checked={checked} onChange={onChange} labelledBy={labelId} disabled={disabled} size="sm" />
			<span id={labelId} className={cn("flex items-center gap-1 text-sm", locked ? "text-muted" : "text-ink")}>
				{label}
			</span>
		</span>
	);
}

type IconButtonProps = { icon: typeof Pencil; label: string; onClick: () => void };

function IconButton({ icon, label, onClick }: IconButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			title={label}
			className="grid h-10 w-10 cursor-pointer place-items-center rounded-md text-ink transition-colors hover:bg-mist"
		>
			<Icon icon={icon} className="text-xl" />
		</button>
	);
}
