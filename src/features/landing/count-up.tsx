"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1200;

/** Counts from 0 to `to` when scrolled into view. Renders the final value until then, so it works without JS. */
export function CountUp({ to }: { to: number }) {
	const ref = useRef<HTMLSpanElement>(null);
	const [value, setValue] = useState(to);

	useEffect(() => {
		const element = ref.current;
		if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		let frame = 0;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) {
					return;
				}
				observer.disconnect();
				const start = performance.now();
				const tick = (now: number) => {
					const progress = Math.min(1, (now - start) / DURATION_MS);
					setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
					if (progress < 1) {
						frame = requestAnimationFrame(tick);
					}
				};
				frame = requestAnimationFrame(tick);
			},
			{ threshold: 0.15 },
		);
		observer.observe(element);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
		};
	}, [to]);

	return <span ref={ref}>{value}</span>;
}
