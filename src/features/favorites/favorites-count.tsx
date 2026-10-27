"use client";

import { createContext, Suspense, use, useState } from "react";

type FavoritesCount = { countPromise: Promise<number | null>; delta: number; adjust: (change: number) => void };

const FavoritesCountContext = createContext<FavoritesCount | null>(null);

export function FavoritesCountProvider({
	countPromise,
	children,
}: {
	countPromise: Promise<number | null>;
	children: React.ReactNode;
}) {
	// The changes since the count was loaded; a fresh count from the server starts over from zero.
	const [changes, setChanges] = useState({ countPromise, delta: 0 });
	const delta = changes.countPromise === countPromise ? changes.delta : 0;

	function adjust(change: number) {
		setChanges((current) => ({
			countPromise,
			delta: (current.countPromise === countPromise ? current.delta : 0) + change,
		}));
	}

	return <FavoritesCountContext value={{ countPromise, delta, adjust }}>{children}</FavoritesCountContext>;
}

/** Tells the header badge that a property was added (+1) or removed (-1). */
export function useAdjustFavoritesCount(): (change: number) => void {
	return use(FavoritesCountContext)?.adjust ?? (() => {});
}

export function FavoritesCountBadge() {
	return (
		<Suspense>
			<Badge />
		</Suspense>
	);
}

function Badge() {
	const context = use(FavoritesCountContext);
	const loaded = context ? use(context.countPromise) : null;
	if (!context || loaded === null) {
		return null;
	}

	const count = Math.max(0, loaded + context.delta);
	if (count === 0) {
		return null;
	}

	return (
		<span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-slate px-1.5 text-[11px] leading-none font-semibold text-white">
			{count}
		</span>
	);
}
