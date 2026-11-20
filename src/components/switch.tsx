"use client";

import { cn } from "@/lib/utils";

type SwitchProps = {
	checked: boolean;
	onChange: (checked: boolean) => void;
	/** Id of the visible label; or `label` when there is none. */
	labelledBy?: string;
	label?: string;
	describedBy?: string;
	disabled?: boolean;
	/** Submitted with the form through a hidden input, as "true" or "false". */
	name?: string;
	size?: "md" | "sm";
	className?: string;
};

export function Switch({
	checked,
	onChange,
	labelledBy,
	label,
	describedBy,
	disabled,
	name,
	size = "md",
	className,
}: SwitchProps) {
	const small = size === "sm";

	return (
		<>
			{name && <input type="hidden" name={name} value={String(checked)} />}
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-labelledby={labelledBy}
				aria-label={label}
				aria-describedby={describedBy}
				onClick={() => onChange(!checked)}
				disabled={disabled}
				className={cn(
					"relative shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
					small ? "h-6 w-10" : "h-7 w-12",
					checked ? "bg-slate" : "bg-line",
					className,
				)}
			>
				<span
					className={cn(
						"absolute top-1 left-1 rounded-full bg-white shadow-sm transition-transform",
						small ? "h-4 w-4" : "h-5 w-5",
						checked && (small ? "translate-x-4" : "translate-x-5"),
					)}
				/>
			</button>
		</>
	);
}
