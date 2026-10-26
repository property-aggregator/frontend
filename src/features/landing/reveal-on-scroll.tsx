"use client";

import { useEffect } from "react";

export function RevealOnScroll() {
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("show");
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.15 },
		);
		document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

		// Content streamed in after hydration (the latest offers) is not in the DOM yet.
		const mutations = new MutationObserver((records) => {
			for (const record of records) {
				for (const node of record.addedNodes) {
					if (!(node instanceof HTMLElement)) {
						continue;
					}
					if (node.matches(".reveal")) {
						observer.observe(node);
					}
					node.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
				}
			}
		});
		mutations.observe(document.body, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
			mutations.disconnect();
		};
	}, []);

	return null;
}
