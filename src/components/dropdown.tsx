"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export type DropdownOption = { value: string; label: string };

type DropdownProps = {
	options: DropdownOption[];
	defaultValue?: string;
	/** Submitted with the form through a hidden input. */
	name?: string;
	onChange?: (value: string) => void;
	/** Id of the visible label, read out together with the selected option. */
	labelId: string;
	variant?: "field" | "inline";
	align?: "left" | "right";
	/** Replaces the default button content: the selected label and a chevron. */
	trigger?: (selectedLabel: string, open: boolean) => React.ReactNode;
};

export function Dropdown({
	options,
	defaultValue = "",
	name,
	onChange,
	labelId,
	variant = "field",
	align = "left",
	trigger,
}: DropdownProps) {
	const id = useId();
	const listId = `${id}-list`;
	const rootRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const [value, setValue] = useState(defaultValue);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);

	const selectedIndex = Math.max(
		options.findIndex((option) => option.value === value),
		0,
	);

	useEffect(() => {
		if (!open) {
			return;
		}
		listRef.current?.focus();
		const close = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("pointerdown", close);
		return () => document.removeEventListener("pointerdown", close);
	}, [open]);

	useEffect(() => {
		if (open) {
			listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
		}
	}, [open, active]);

	function show() {
		setActive(selectedIndex);
		setOpen(true);
	}

	function hide() {
		setOpen(false);
		buttonRef.current?.focus();
	}

	function choose(index: number) {
		const next = options[index].value;
		hide();
		if (next !== value) {
			setValue(next);
			onChange?.(next);
		}
	}

	function onButtonKeyDown(event: KeyboardEvent) {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			show();
		}
	}

	function onListKeyDown(event: KeyboardEvent) {
		const last = options.length - 1;
		const moves: Record<string, number> = {
			ArrowDown: Math.min(active + 1, last),
			ArrowUp: Math.max(active - 1, 0),
			Home: 0,
			End: last,
		};

		if (event.key in moves) {
			event.preventDefault();
			setActive(moves[event.key]);
		} else if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			choose(active);
		} else if (event.key === "Escape") {
			event.preventDefault();
			hide();
		} else if (event.key === "Tab") {
			setOpen(false);
		}
	}

	return (
		<div ref={rootRef} className="relative">
			{name && <input type="hidden" name={name} value={value} />}
			<button
				ref={buttonRef}
				id={id}
				type="button"
				onClick={() => (open ? setOpen(false) : show())}
				onKeyDown={onButtonKeyDown}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-labelledby={`${labelId} ${id}`}
				className={cn(
					"flex w-full cursor-pointer items-center justify-between gap-2 text-left",
					variant === "field" ? "field" : "head font-semibold text-ink",
				)}
			>
				{trigger ? (
					trigger(options[selectedIndex]?.label ?? "", open)
				) : (
					<>
						<span className="truncate">{options[selectedIndex]?.label}</span>
						<Chevron open={open} />
					</>
				)}
			</button>
			{open && (
				<ul
					ref={listRef}
					id={listId}
					role="listbox"
					tabIndex={-1}
					aria-labelledby={labelId}
					aria-activedescendant={`${listId}-${active}`}
					onKeyDown={onListKeyDown}
					className={cn(
						"absolute z-30 mt-1.5 max-h-72 min-w-full overflow-auto rounded-lg border border-line bg-white shadow-lg outline-none",
						align === "right" ? "right-0" : "left-0",
					)}
				>
					{options.map((option, index) => (
						<li
							key={option.value}
							id={`${listId}-${index}`}
							role="option"
							aria-selected={index === selectedIndex}
							onClick={() => choose(index)}
							onPointerMove={() => setActive(index)}
							className={cn(
								"flex cursor-pointer items-center justify-between gap-4 px-3.5 py-2.5 whitespace-nowrap text-ink",
								index === active && "bg-mist",
								index === selectedIndex && "font-semibold text-slate",
							)}
						>
							{option.label}
							{index === selectedIndex && <Icon icon={Check} className="text-[16px]" />}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export function Chevron({ open }: { open: boolean }) {
	return (
		<Icon icon={ChevronDown} className={cn("text-[18px] text-muted transition-transform", open && "rotate-180")} />
	);
}
