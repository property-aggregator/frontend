"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { BrandName, LogoMark } from "@/components/logo";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navItems = [
	{ id: "top", label: "Start" },
	{ id: "funkcje", label: "Funkcje" },
	{ id: "cennik", label: "Cennik" },
	{ id: "kontakt", label: "Kontakt" },
];

function useActiveSection(): string {
	const [active, setActive] = useState(navItems[0].id);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActive(entry.target.id);
					}
				}
			},
			{ rootMargin: "-45% 0px -50% 0px" },
		);
		for (const { id } of navItems) {
			const section = document.getElementById(id);
			if (section) {
				observer.observe(section);
			}
		}
		return () => observer.disconnect();
	}, []);

	return active;
}

function Brand({ onClick }: { onClick?: () => void }) {
	return (
		<Link href="/#top" onClick={onClick} className="flex items-center gap-2.5">
			<LogoMark />
			<span className="head leading-none">
				<span className="block text-[17px] font-semibold text-ink">
					<BrandName />
				</span>
				<span className="mt-1 block text-[10px] tracking-[.2em]">Wyszukiwarka ofert</span>
			</span>
		</Link>
	);
}

export function SiteHeader() {
	const section = useActiveSection();
	const active = usePathname() === routes.home ? section : null;
	const [menuOpen, setMenuOpen] = useState(false);

	// The open menu covers the screen: the page behind does not scroll, Escape or a wider window closes it.
	useEffect(() => {
		if (!menuOpen) {
			return;
		}
		const overflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const close = () => setMenuOpen(false);
		const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && close();
		const wide = window.matchMedia("(min-width: 64rem)");
		wide.addEventListener("change", close);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.body.style.overflow = overflow;
			wide.removeEventListener("change", close);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [menuOpen]);

	return (
		<>
			<div className="bg-mist text-sm text-ink">
				<div className="mx-auto flex max-w-[1170px] items-center justify-center gap-2 px-6 py-2 text-center">
					<span>
						<b className="font-medium">Aplikacja jest w fazie rozwoju.</b> Część funkcji może jeszcze nie
						działać poprawnie.
					</span>
				</div>
			</div>

			<header className="sticky top-0 z-50 border-b border-ink/[0.12] bg-white">
				<div className="mx-auto flex h-[76px] max-w-[1170px] items-center justify-between px-6">
					<Brand />
					<nav className="hidden items-center gap-8 lg:flex">
						{navItems.map(({ id, label }) => (
							<Link key={id} className="nav-link" href={`/#${id}`} aria-current={active === id}>
								{label}
							</Link>
						))}
					</nav>
					<div className="hidden items-center gap-2 sm:flex">
						{/* Plain <a>: this path is a redirecting route handler, not a page, so Link must not prefetch it. */}
						<a href={routes.loginPage} className="btn btn-sm btn-soft">
							Zaloguj się
						</a>
					</div>
					<button
						type="button"
						onClick={() => setMenuOpen(!menuOpen)}
						className="grid h-10 w-10 cursor-pointer place-items-center rounded-md bg-mist text-ink sm:ml-3 lg:hidden"
						aria-label="Menu"
						aria-expanded={menuOpen}
						aria-controls="mobile-menu"
					>
						<Icon icon={menuOpen ? X : Menu} />
					</button>
				</div>
				{/* Over the whole screen, the banner included: below it the header would not always sit at the top. */}
				<div
					id="mobile-menu"
					className={cn(
						menuOpen ? "flex" : "hidden",
						"fixed inset-0 z-[60] flex-col overflow-y-auto bg-white lg:hidden",
					)}
				>
					<div className="flex h-[76px] shrink-0 items-center justify-between border-b border-ink/[0.12] px-6">
						<Brand onClick={() => setMenuOpen(false)} />
						<button
							type="button"
							onClick={() => setMenuOpen(false)}
							className="grid h-10 w-10 cursor-pointer place-items-center rounded-md bg-mist text-ink"
							aria-label="Zamknij menu"
						>
							<Icon icon={X} />
						</button>
					</div>
					<div className="flex flex-1 flex-col px-6 py-4">
						{navItems.map(({ id, label }) => (
							<Link
								key={id}
								className="head border-b border-line py-4 text-center text-base font-semibold text-ink uppercase"
								href={`/#${id}`}
								onClick={() => setMenuOpen(false)}
							>
								{label}
							</Link>
						))}
						<div className="pt-6">
							<a href={routes.loginPage} className="btn btn-sm btn-soft w-full">
								Zaloguj się
							</a>
						</div>
					</div>
				</div>
			</header>
		</>
	);
}
