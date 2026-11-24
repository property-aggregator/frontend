"use client";

import { useEffect, useId, useRef } from "react";

type ConfirmDialogProps = {
	open: boolean;
	title: string;
	message?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	pending?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};

/** A modal question in the middle of the screen; only its buttons, or Escape, close it. */
export function ConfirmDialog({
	open,
	title,
	message,
	confirmLabel = "Tak",
	cancelLabel = "Nie",
	pending,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const ref = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const messageId = useId();

	useEffect(() => {
		const dialog = ref.current;
		if (open && !dialog?.open) {
			dialog?.showModal();
		} else if (!open && dialog?.open) {
			dialog.close();
		}
	}, [open]);

	return (
		<dialog
			ref={ref}
			aria-labelledby={titleId}
			aria-describedby={message ? messageId : undefined}
			// Escape closes the dialog natively; the parent's state follows.
			onCancel={(event) => {
				event.preventDefault();
				onCancel();
			}}
			className="m-auto w-[calc(100%-32px)] max-w-[400px] rounded-lg bg-white p-6 text-body shadow-card backdrop:bg-ink/40"
		>
			<h2 id={titleId} className="head text-xl font-semibold">
				{title}
			</h2>
			{message && (
				<p id={messageId} className="mt-2">
					{message}
				</p>
			)}
			<div className="mt-6 flex gap-2">
				<button
					type="button"
					onClick={onConfirm}
					disabled={pending}
					className="btn btn-sm btn-primary flex-1 disabled:opacity-50"
				>
					{confirmLabel}
				</button>
				<button type="button" onClick={onCancel} autoFocus className="btn btn-sm btn-soft flex-1">
					{cancelLabel}
				</button>
			</div>
		</dialog>
	);
}
