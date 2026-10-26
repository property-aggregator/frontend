"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { BrandName, LogoMark } from "@/components/logo";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navItems = [
	{ id: "top", label: "Start" },
	{ id: "oferty", label: "Oferty" },
	{ id: "funkcje", label: "Funkcje" },
	{ id: "mapa", label: "Mapa" },
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

export function SiteHeader() {
	const section = useActiveSection();
	const active = usePathname() === routes.home ? section : null;
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<>
			<div className="border-b border-line bg-mist text-[13px] text-ink">
				<div className="mx-auto flex max-w-[1170px] items-center justify-center gap-2 px-6 py-2 text-center">
					<span>
						<b className="font-medium">Aplikacja jest w fazie rozwoju.</b> Część funkcji może jeszcze nie
						działać poprawnie.
					</span>
				</div>
			</div>

			<header className="sticky top-0 z-50 border-b border-line bg-white">
				<div className="mx-auto flex h-[76px] max-w-[1170px] items-center justify-between px-6">
					<Link href="/#top" className="flex items-center gap-2.5">
						<LogoMark />
						<span className="head leading-none">
							<span className="block text-[17px] font-semibold text-ink">
								<BrandName />
							</span>
							<span className="mt-1 block text-[10px] tracking-[.2em]">Agregator ofert</span>
						</span>
					</Link>
					<nav className="hidden items-center gap-8 lg:flex">
						{navItems.map(({ id, label }) => (
							<Link key={id} className="nav-link" href={`/#${id}`} aria-current={active === id}>
								{label}
							</Link>
						))}
					</nav>
					<div className="hidden items-center gap-2 sm:flex">
						{/* Plain <a>: /auth/* is handled by the Auth0 middleware, not by a page. */}
						<a href={routes.login} className="btn btn-sm btn-soft">
							Zaloguj się
						</a>
						<Link href="/#cennik" className="btn btn-sm btn-primary">
							Zacznij za 0 zł
						</Link>
					</div>
					<button
						type="button"
						onClick={() => setMenuOpen(!menuOpen)}
						className="grid h-10 w-10 cursor-pointer place-items-center rounded-md bg-mist text-ink sm:ml-3 lg:hidden"
						aria-label="Menu"
						aria-expanded={menuOpen}
						aria-controls="mobile-menu"
					>
						<Icon icon={Menu} />
					</button>
				</div>
				<div
					id="mobile-menu"
					className={cn(menuOpen ? "flex" : "hidden", "flex-col border-t border-line px-6 py-2 lg:hidden")}
				>
					{navItems.map(({ id, label }) => (
						<Link
							key={id}
							className="head py-2.5 text-[13px] text-ink uppercase"
							href={`/#${id}`}
							onClick={() => setMenuOpen(false)}
						>
							{label}
						</Link>
					))}
					<div className="grid grid-cols-2 gap-2 py-2">
						<a href={routes.login} className="btn btn-sm btn-soft">
							Zaloguj się
						</a>
						<Link href="/#cennik" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>
							Zacznij za 0 zł
						</Link>
					</div>
				</div>
			</header>
		</>
	);
}
