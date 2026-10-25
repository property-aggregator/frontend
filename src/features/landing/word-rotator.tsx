"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 2600;
const TRANSITION_MS = 500;

export function WordRotator({ words }: { words: string[] }) {
	const [{ current, previous }, setState] = useState<{ current: number; previous: number | null }>({
		current: 0,
		previous: null,
	});

	useEffect(() => {
		let resetId: ReturnType<typeof setTimeout>;
		const id = setInterval(() => {
			setState(({ current }) => ({ current: (current + 1) % words.length, previous: current }));
			// Once it has slid out, move the previous word back below, ready to slide in again.
			resetId = setTimeout(() => setState((state) => ({ ...state, previous: null })), TRANSITION_MS);
		}, INTERVAL_MS);
		return () => {
			clearInterval(id);
			clearTimeout(resetId);
		};
	}, [words.length]);

	return (
		<span className="rotator">
			{words.map((word, index) => (
				<span
					key={word}
					className={cn(index === current && "on", index === previous && "out")}
					aria-hidden={index !== current}
				>
					{word}
				</span>
			))}
		</span>
	);
}
