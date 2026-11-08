"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { routes } from "@/lib/routes";

const CURRENT_KEY = "navigation:current";
const PREVIOUS_KEY = "navigation:previous";
const LAST_SEARCH_KEY = "navigation:last-search";

function Tracker() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		const url = searchParams.size > 0 ? `${pathname}?${searchParams}` : pathname;
		const current = sessionStorage.getItem(CURRENT_KEY);
		// A reload keeps the same url, and must not lose the page the user came from.
		if (current !== url) {
			if (current) {
				sessionStorage.setItem(PREVIOUS_KEY, current);
			}
			sessionStorage.setItem(CURRENT_KEY, url);
		}
		if (pathname === routes.search) {
			sessionStorage.setItem(LAST_SEARCH_KEY, url);
		}
	}, [pathname, searchParams]);

	return null;
}

export function NavigationTracker() {
	return (
		<Suspense fallback={null}>
			<Tracker />
		</Suspense>
	);
}

/**
 * Goes back in history when the previous page was the search, so its filters and scroll position come back;
 * otherwise opens the last search of this tab, or an empty one.
 */
export function BackToSearchLink({ className, children }: { className?: string; children: React.ReactNode }) {
	const router = useRouter();

	function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
			return;
		}
		const previous = sessionStorage.getItem(PREVIOUS_KEY);
		if (previous === routes.search || previous?.startsWith(`${routes.search}?`)) {
			event.preventDefault();
			router.back();
			return;
		}
		const lastSearch = sessionStorage.getItem(LAST_SEARCH_KEY);
		if (lastSearch) {
			event.preventDefault();
			router.push(lastSearch);
		}
	}

	return (
		<Link href={routes.search} onClick={onClick} className={className}>
			{children}
		</Link>
	);
}
