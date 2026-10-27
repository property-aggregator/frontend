"use client";

import { Heart, LogOut, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { BrandName, LogoMark } from "@/components/logo";
import { FavoritesCountBadge } from "@/features/favorites/favorites-count";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: routes.properties, label: "Start" },
	{ href: routes.search, label: "Szukaj" },
];

const iconLinks = [
	{ href: routes.favorites, label: "Ulubione", icon: Heart },
	{ href: routes.account, label: "Konto", icon: UserRound },
];

export function AppHeader() {
	const pathname = usePathname();
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-line bg-white">
			<div className="mx-auto flex h-[76px] max-w-[1360px] items-center justify-between gap-4 px-6 sm:gap-6">
				<Link href={routes.properties} className="flex items-center gap-2.5">
					<LogoMark />
					<span className="head hidden text-[17px] leading-none font-semibold sm:block">
						<BrandName />
					</span>
				</Link>
				<nav className="hidden items-center gap-8 md:flex">
					{navItems.map(({ href, label }) => (
						<Link key={href} className="nav-link" href={href} aria-current={pathname === href}>
							{label}
						</Link>
					))}
				</nav>
				<div className="flex items-center gap-2">
					{iconLinks.map(({ href, label, icon }) => (
						<Link
							key={href}
							href={href}
							onClick={() => setMenuOpen(false)}
							className="btn btn-sm btn-soft relative px-3"
							aria-label={label}
							title={label}
							aria-current={pathname === href ? "page" : undefined}
						>
							<Icon icon={icon} className="text-[18px]" />
							{href === routes.favorites && <FavoritesCountBadge />}
						</Link>
					))}
					{/* Plain <a>: logout is an Auth0 route handler, so Link must not prefetch it. */}
					<a href={routes.logout} className="btn btn-sm btn-soft hidden md:inline-flex">
						<Icon icon={LogOut} className="text-[18px]" />
						Wyloguj
					</a>
					<button
						type="button"
						onClick={() => setMenuOpen(!menuOpen)}
						className="grid h-10 w-10 cursor-pointer place-items-center rounded-md bg-mist text-ink md:hidden"
						aria-label="Menu"
						aria-expanded={menuOpen}
						aria-controls="app-mobile-menu"
					>
						<Icon icon={menuOpen ? X : Menu} />
					</button>
				</div>
			</div>
			<div
				id="app-mobile-menu"
				className={cn(menuOpen ? "flex" : "hidden", "flex-col border-t border-line px-6 py-2 md:hidden")}
			>
				{navItems.map(({ href, label }) => (
					<Link
						key={href}
						href={href}
						onClick={() => setMenuOpen(false)}
						aria-current={pathname === href ? "page" : undefined}
						className="head py-2.5 text-[13px] text-ink uppercase"
					>
						{label}
					</Link>
				))}
				<div className="py-2">
					<a href={routes.logout} className="btn btn-sm btn-soft w-full">
						<Icon icon={LogOut} className="text-[18px]" />
						Wyloguj
					</a>
				</div>
			</div>
		</header>
	);
}
