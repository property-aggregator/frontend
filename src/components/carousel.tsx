"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const slideClassName = "w-[80%] shrink-0 snap-start sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-60px)/4)]";

const BOUNCE_PX = 24;
const MAX_PULL_PX = 90;
const PULL_RESISTANCE = 0.4;
const springEasing = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const DRAG_THRESHOLD_PX = 5;
const FLING_FACTOR = 10;

type Edges = { start: boolean; end: boolean };
type Touch = { startX: number; startY: number; x: number; horizontal: boolean | null; pull: number };
type Drag = { startX: number; x: number; delta: number; moved: boolean; pull: number };

function edgesOf(element: HTMLElement): Edges {
	return {
		start: element.scrollLeft <= 1,
		end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
	};
}

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function bounce(element: HTMLElement, direction: -1 | 1) {
	if (prefersReducedMotion()) {
		return;
	}
	element.animate(
		[{ transform: "none" }, { transform: `translateX(${direction * BOUNCE_PX}px)` }, { transform: "none" }],
		{ duration: 500, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
	);
}

function isScrollable(element: HTMLElement): boolean {
	return element.scrollWidth > element.clientWidth;
}

/** Past the edge, the list follows the pointer with resistance, like the rubber band on iOS. */
function pullBy(element: HTMLElement, state: { pull: number }, delta: number): boolean {
	const { start, end } = edgesOf(element);
	if (state.pull === 0 && !(start && delta > 0) && !(end && delta < 0)) {
		return false;
	}
	const next = state.pull + delta * PULL_RESISTANCE;
	const pull = state.pull > 0 ? Math.max(0, next) : state.pull < 0 ? Math.min(0, next) : next;
	state.pull = Math.max(-MAX_PULL_PX, Math.min(MAX_PULL_PX, pull));
	element.style.transform = state.pull ? `translateX(${state.pull}px)` : "";
	return true;
}

function releasePull(element: HTMLElement, pull: number) {
	if (pull === 0) {
		return;
	}
	element.style.transform = "";
	if (!prefersReducedMotion()) {
		element.animate([{ transform: `translateX(${pull}px)` }, { transform: "none" }], {
			duration: 450,
			easing: springEasing,
		});
	}
}

function settleOnSlide(element: HTMLElement, lastDelta: number) {
	const padding = parseFloat(getComputedStyle(element).scrollPaddingLeft) || 0;
	const trackLeft = element.getBoundingClientRect().left + padding;
	const heading = -lastDelta * FLING_FACTOR;
	let target = element.scrollLeft;
	let best = Infinity;
	for (const slide of element.children) {
		const offset = slide.getBoundingClientRect().left - trackLeft;
		if (Math.abs(offset - heading) < best) {
			best = Math.abs(offset - heading);
			target = element.scrollLeft + offset;
		}
	}

	const restoreSnap = () => {
		clearTimeout(fallback);
		element.style.scrollSnapType = "";
	};
	const fallback = setTimeout(restoreSnap, 700);
	element.addEventListener("scrollend", restoreSnap, { once: true });
	element.scrollTo({ left: target, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/**
 * Horizontal scrolling that bounces off the ends of the list and can be dragged with a mouse;
 * spread `handlers` on the element given `ref`.
 */
export function useOverscrollBounce<T extends HTMLElement>() {
	const track = useRef<T>(null);
	const [edges, setEdges] = useState<Edges>({ start: true, end: true });
	const lastEdges = useRef<Edges>({ start: true, end: true });
	const touch = useRef<Touch | null>(null);
	const drag = useRef<Drag | null>(null);

	function updateEdges() {
		const element = track.current;
		if (!element) {
			return;
		}
		const next = edgesOf(element);
		const previous = lastEdges.current;
		lastEdges.current = next;
		if (next.start !== previous.start || next.end !== previous.end) {
			setEdges(next);
		}
		// While a finger or the mouse is down, pulling past the edge is handled by their handlers instead.
		if (!touch.current && !drag.current?.moved) {
			if (next.end && !previous.end) {
				bounce(element, -1);
			} else if (next.start && !previous.start) {
				bounce(element, 1);
			}
		}
	}

	function onTouchStart(event: React.TouchEvent) {
		const { clientX, clientY } = event.touches[0];
		touch.current = { startX: clientX, startY: clientY, x: clientX, horizontal: null, pull: 0 };
	}

	function onTouchMove(event: React.TouchEvent) {
		const state = touch.current;
		const element = track.current;
		if (!state || !element || !isScrollable(element)) {
			return;
		}
		const { clientX, clientY } = event.touches[0];
		state.horizontal ??= Math.abs(clientX - state.startX) > Math.abs(clientY - state.startY);
		const delta = clientX - state.x;
		state.x = clientX;
		if (state.horizontal) {
			pullBy(element, state, delta);
		}
	}

	function onTouchEnd() {
		const pull = touch.current?.pull ?? 0;
		touch.current = null;
		if (track.current) {
			releasePull(track.current, pull);
		}
	}

	function onPointerDown(event: React.PointerEvent) {
		const element = track.current;
		if (event.pointerType !== "mouse" || event.button !== 0 || !element || !isScrollable(element)) {
			return;
		}
		// Otherwise the press starts a text selection, which scrolls the list on its own and fights the drag.
		event.preventDefault();
		drag.current = { startX: event.clientX, x: event.clientX, delta: 0, moved: false, pull: 0 };
	}

	function onPointerMove(event: React.PointerEvent) {
		const state = drag.current;
		const element = track.current;
		if (!state || !element) {
			return;
		}
		if (!state.moved) {
			if (Math.abs(event.clientX - state.startX) < DRAG_THRESHOLD_PX) {
				return;
			}
			state.moved = true;
			element.setPointerCapture(event.pointerId);
			// Snapping would pull the list back on every frame of the drag.
			element.style.scrollSnapType = "none";
			element.style.cursor = "grabbing";
			element.dataset.dragging = "";
		}
		state.delta = event.clientX - state.x;
		state.x = event.clientX;
		if (!pullBy(element, state, state.delta)) {
			element.scrollLeft -= state.delta;
		}
	}

	function onPointerUp() {
		const state = drag.current;
		drag.current = null;
		const element = track.current;
		if (!state?.moved || !element) {
			return;
		}
		element.style.cursor = "";
		delete element.dataset.dragging;
		releasePull(element, state.pull);
		settleOnSlide(element, state.delta);

		// The release would otherwise click the link or button the drag started on.
		const preventClick = (click: MouseEvent) => {
			click.preventDefault();
			click.stopPropagation();
		};
		element.addEventListener("click", preventClick, { capture: true, once: true });
		setTimeout(() => element.removeEventListener("click", preventClick, { capture: true }));
	}

	useEffect(() => {
		const element = track.current;
		if (!element) {
			return;
		}
		// Fires right after observe() too, which sets the initial state.
		const observer = new ResizeObserver(updateEdges);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return {
		ref: track,
		edges,
		handlers: {
			onScroll: updateEdges,
			onTouchStart,
			onTouchMove,
			onTouchEnd,
			onTouchCancel: onTouchEnd,
			onPointerDown,
			onPointerMove,
			onPointerUp,
			onPointerCancel: onPointerUp,
			// Links and images inside would otherwise start a native drag and swallow the pointer events.
			onDragStart: (event: React.DragEvent) => event.preventDefault(),
		},
	};
}

export function Carousel({ label, children }: { label: string; children: React.ReactNode }) {
	const { ref: track, edges, handlers } = useOverscrollBounce<HTMLDivElement>();

	function scroll(direction: -1 | 1) {
		const element = track.current;
		element?.scrollBy({ left: direction * element.clientWidth, behavior: "smooth" });
	}

	return (
		<div className="relative" role="region" aria-roledescription="karuzela" aria-label={label}>
			<div
				ref={track}
				{...handlers}
				// The padding keeps the hover shadow of the slides from being clipped by the scroll container.
				className="-m-3 flex snap-x snap-mandatory scroll-px-3 [scrollbar-width:none] gap-5 overflow-x-auto p-3 [&::-webkit-scrollbar]:hidden"
			>
				{Children.map(children, (child) => (
					<div className={slideClassName}>{child}</div>
				))}
			</div>
			<ArrowButton direction={-1} hidden={edges.start} onClick={() => scroll(-1)} />
			<ArrowButton direction={1} hidden={edges.end} onClick={() => scroll(1)} />
		</div>
	);
}

function ArrowButton({ direction, hidden, onClick }: { direction: -1 | 1; hidden: boolean; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={direction < 0 ? "Przewiń w lewo" : "Przewiń w prawo"}
			className={cn(
				"absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white text-ink shadow-[0_2px_12px_rgb(23_38_46/0.2)] transition-colors hover:bg-mist sm:grid",
				direction < 0 ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
				hidden && "sm:hidden",
			)}
		>
			<Icon icon={direction < 0 ? ChevronLeft : ChevronRight} className="text-[22px]" />
		</button>
	);
}

export function CarouselSkeleton({ height }: { height: string }) {
	return (
		<div className="flex gap-5 overflow-hidden" aria-hidden="true">
			{Array.from({ length: 4 }, (_, index) => (
				<div key={index} className={cn(slideClassName, height, "animate-pulse rounded-xl bg-white")} />
			))}
		</div>
	);
}
