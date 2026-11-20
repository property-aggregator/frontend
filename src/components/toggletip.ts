"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

const SCREEN_MARGIN_PX = 16;

/**
 * An explanation shown while a mouse is over the trigger, or after a tap on phones; a tap elsewhere or Escape closes it.
 * Shown, the bubble moves sideways to stay on screen.
 */
export function useToggletip<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const bubbleRef = useRef<HTMLSpanElement>(null);
	const [open, setOpen] = useState(false);
	const [hovered, setHovered] = useState(false);
	const visible = open || hovered;

	useEffect(() => {
		if (!open) {
			return;
		}
		const close = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
		document.addEventListener("pointerdown", close);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("pointerdown", close);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [open]);

	useLayoutEffect(() => {
		const bubble = bubbleRef.current;
		if (!visible || !bubble) {
			return;
		}
		// A margin, as the translate classes that centre some bubbles use the translate property.
		bubble.style.marginLeft = "";
		const { left, right } = bubble.getBoundingClientRect();
		const screenRight = document.documentElement.clientWidth - SCREEN_MARGIN_PX;
		// Left before right: a bubble wider than the screen still starts on it.
		const shift = Math.max(Math.min(0, screenRight - right), SCREEN_MARGIN_PX - left);
		bubble.style.marginLeft = `${shift}px`;
	}, [visible]);

	// Touch has no hover: a tap both "enters" and clicks, which would open and at once close it again.
	const onMouse = (hover: boolean) => (event: ReactPointerEvent) =>
		event.pointerType === "mouse" && setHovered(hover);

	return {
		ref,
		bubbleRef,
		open,
		visible,
		triggerProps: {
			onClick: () => setOpen(!open),
			onPointerEnter: onMouse(true),
			onPointerLeave: onMouse(false),
			"aria-expanded": open,
		},
	};
}

/** The bubble below its trigger; hidden, it takes no room, so it cannot widen the page. */
export function toggletipClassName(visible: boolean, className?: string): string {
	return cn(
		"pointer-events-none absolute top-full z-30 mt-1.5 w-max max-w-[min(240px,calc(100vw-32px))] rounded-md bg-ink px-3 py-2 font-sans text-xs font-normal whitespace-normal text-white shadow-lg",
		visible ? "block" : "hidden",
		className,
	);
}
