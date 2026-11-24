"use client";

import { createContext, Suspense, use, useEffect, useState } from "react";
import { CountBadge } from "@/components/count-badge";

const POLL_INTERVAL_MS = 60 * 1000;

type UnreadCount = {
	countPromise: Promise<number | null>;
	/** The last count from polling, if any; replaces the one loaded with the page. */
	polled: number | null;
	delta: number;
	adjust: (change: number) => void;
};

const UnreadCountContext = createContext<UnreadCount | null>(null);

type State = { countPromise: Promise<number | null>; polled: number | null; delta: number };

export function UnreadNotificationsProvider({
	countPromise,
	children,
}: {
	countPromise: Promise<number | null>;
	children: React.ReactNode;
}) {
	// A fresh count, from the server or from polling, starts the local changes over from zero.
	const [state, setState] = useState<State>({ countPromise, polled: null, delta: 0 });
	const current = state.countPromise === countPromise ? state : { countPromise, polled: null, delta: 0 };

	function adjust(change: number) {
		setState((previous) => {
			const base = previous.countPromise === countPromise ? previous : { countPromise, polled: null, delta: 0 };
			return { ...base, delta: base.delta + change };
		});
	}

	useEffect(() => {
		async function poll() {
			try {
				const { count } = (await (await fetch("/api/notifications/unread-count")).json()) as {
					count: number | null;
				};
				if (typeof count === "number") {
					setState({ countPromise, polled: count, delta: 0 });
				}
			} catch {
				// The badge keeps its last count until the next poll.
			}
		}

		// Not while the tab is hidden; once it is shown again, right away.
		const pollIfShown = () => document.visibilityState === "visible" && poll();
		const interval = setInterval(pollIfShown, POLL_INTERVAL_MS);
		document.addEventListener("visibilitychange", pollIfShown);
		return () => {
			clearInterval(interval);
			document.removeEventListener("visibilitychange", pollIfShown);
		};
	}, [countPromise]);

	return (
		<UnreadCountContext value={{ countPromise, polled: current.polled, delta: current.delta, adjust }}>
			{children}
		</UnreadCountContext>
	);
}

/** Tells the header badge that notifications were read (-1 each). */
export function useAdjustUnreadCount(): (change: number) => void {
	return use(UnreadCountContext)?.adjust ?? (() => {});
}

export function UnreadNotificationsBadge() {
	return (
		<Suspense>
			<Badge />
		</Suspense>
	);
}

function Badge() {
	const context = use(UnreadCountContext);
	const loaded = context ? use(context.countPromise) : null;
	const count = context?.polled ?? loaded;
	if (!context || count === null) {
		return null;
	}

	return <CountBadge count={count + context.delta} />;
}
