"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const HOLD_MS = 2000;

// Module state, not refs: Next.js may remount this component on a navigation, which would lose them.
const positions = new Map<string, number>();
let lastUrl: string | null = null;
let navigating = false;
let popped = false;
let listening = false;

function currentUrl() {
	return window.location.pathname + window.location.search;
}

function listen() {
	if (listening) {
		return;
	}
	listening = true;
	window.history.scrollRestoration = "manual";

	window.addEventListener(
		"scroll",
		() => {
			// While the next page replaces this one, the scroll events are not the user's.
			if (!navigating && lastUrl) {
				positions.set(lastUrl, window.scrollY);
			}
		},
		{ passive: true },
	);
	document.addEventListener(
		"click",
		(event) => {
			const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
			if (
				link instanceof HTMLAnchorElement &&
				link.origin === window.location.origin &&
				!link.target &&
				link.pathname + link.search !== currentUrl()
			) {
				navigating = true;
			}
		},
		true,
	);
	window.addEventListener("popstate", () => {
		navigating = true;
		popped = true;
	});
}

/** Makes the next navigation return to where the user was on that url, as back does. */
export function restoreScrollOnNextNavigation() {
	navigating = true;
	popped = true;
}

/** Holds the position until the streamed content is tall enough for it, or until the user scrolls. */
function hold(target: number) {
	const until = performance.now() + HOLD_MS;
	let frame = 0;
	const stop = () => {
		cancelAnimationFrame(frame);
		for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) {
			window.removeEventListener(type, stop);
		}
	};
	const tick = () => {
		if (window.scrollY !== target) {
			window.scrollTo({ top: target, left: 0, behavior: "instant" });
		}
		if (performance.now() < until) {
			frame = requestAnimationFrame(tick);
		} else {
			stop();
		}
	};
	for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) {
		window.addEventListener(type, stop, { passive: true });
	}
	tick();
	return stop;
}

/**
 * Pages stream in, so neither the browser's restoration nor Next.js lands where it should: a page that is still
 * short clamps the position. A new page holds the top, back and forward hold the remembered position.
 */
export function ScrollRestoration() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		listen();
		const next = currentUrl();
		const previous = lastUrl;
		const wasPopped = popped;
		lastUrl = next;
		navigating = false;
		popped = false;

		if (previous === null || previous === next) {
			return;
		}
		if (wasPopped) {
			return hold(positions.get(next) ?? 0);
		}
		// Other filters or another page of results keep the position.
		if (previous.split("?")[0] !== pathname && !window.location.hash) {
			return hold(0);
		}
	}, [pathname, searchParams]);

	return null;
}
