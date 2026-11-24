"use client";

import { useEffect, useId, useState, useTransition, type FormEvent } from "react";
import { Chevron, Dropdown } from "@/components/dropdown";
import { cn } from "@/lib/utils";
import { saveNotificationSettings } from "./actions";
import type { NotificationSettings } from "./api";
import { useContacts } from "./contacts";
import { joinPhone, PHONE_NUMBER_PATTERN, phoneCountries, splitPhone } from "./phone";

const prefixOptions = phoneCountries.map(({ name, prefix }) => ({ value: prefix, label: `${name} ${prefix}` }));

type Status = { kind: "saved" | "error"; message: string; field?: "email" | "phone" };

export function NotificationSettingsForm({ initial }: { initial: NotificationSettings }) {
	const emailId = useId();
	const phoneLabelId = useId();
	const prefixLabelId = useId();
	const initialPhone = splitPhone(initial.phone);
	const [prefix, setPrefix] = useState(initialPhone.prefix);
	const [status, setStatus] = useState<Status | null>(null);
	const [pending, startTransition] = useTransition();
	const { setSettings } = useContacts();

	useEffect(() => {
		if (status?.kind !== "saved") {
			return;
		}
		const timeout = setTimeout(() => setStatus(null), 3000);
		return () => clearTimeout(timeout);
	}, [status]);

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const email = String(data.get("email") ?? "").trim();
		const number = String(data.get("phone") ?? "").replace(/[\s-]/g, "");

		if (number !== "" && !PHONE_NUMBER_PATTERN.test(number.replace(/^0+/, ""))) {
			setStatus({ kind: "error", field: "phone", message: "Podaj numer bez kierunkowego, same cyfry." });
			return;
		}

		setStatus(null);
		startTransition(async () => {
			const result = await saveNotificationSettings({
				email: email || null,
				phone: number ? joinPhone(prefix, number) : null,
			});
			startTransition(() => {
				if (result.settings) {
					setSettings(result.settings);
					setStatus({ kind: "saved", message: "Zapisano." });
				} else {
					setStatus({
						kind: "error",
						field: result.field,
						message: result.error ?? "Nie udało się zapisać.",
					});
				}
			});
		});
	}

	return (
		<form onSubmit={onSubmit} className="grid gap-4">
			<div className="grid gap-1.5">
				<label htmlFor={emailId} className="head text-sm font-medium">
					E-mail
				</label>
				<input
					id={emailId}
					type="email"
					name="email"
					defaultValue={initial.email ?? ""}
					placeholder="jan@example.com"
					autoComplete="email"
					aria-invalid={status?.field === "email" || undefined}
					className="field"
				/>
			</div>
			<div className="grid gap-1.5">
				<span id={phoneLabelId} className="head text-sm font-medium">
					Telefon (SMS)
				</span>
				<div className="flex gap-2">
					<div className="w-[104px] shrink-0">
						<span id={prefixLabelId} className="sr-only">
							Kraj
						</span>
						<Dropdown
							labelId={prefixLabelId}
							options={prefixOptions}
							defaultValue={prefix}
							onChange={setPrefix}
							trigger={(_, open) => (
								<>
									<span>{prefix}</span>
									<Chevron open={open} />
								</>
							)}
						/>
					</div>
					<input
						type="tel"
						name="phone"
						inputMode="numeric"
						defaultValue={initialPhone.number}
						placeholder="123 456 789"
						autoComplete="tel-national"
						aria-labelledby={phoneLabelId}
						aria-invalid={status?.field === "phone" || undefined}
						className="field min-w-0 flex-1"
					/>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<button type="submit" disabled={pending} className="btn btn-sm btn-primary disabled:opacity-50">
					Zapisz
				</button>
				{status && (
					<p
						role="status"
						className={cn("text-sm", status.kind === "error" ? "font-semibold text-ink" : "text-muted")}
					>
						{status.message}
					</p>
				)}
			</div>
		</form>
	);
}
