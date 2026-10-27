"use client";

import { Heart, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { BrandName, LogoMark } from "@/components/logo";
import { FavoritesCountBadge } from "@/features/favorites/favorites-count";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: routes.properties, label: "Start", className: "hidden sm:block" },
	{ href: routes.search, label: "Szukaj" },
];

const iconLinks = [
	{ href: routes.favorites, label: "Ulubione", icon: Heart },
	{ href: routes.account, label: "Konto", icon: UserRound },
];

export function AppHeader() {
	const pathname = usePathname();

	return (
		<header className="sticky top-0 z-50 border-b border-line bg-white">
			<div className="mx-auto flex h-[76px] max-w-[1360px] items-center justify-between gap-4 px-6 sm:gap-6">
				<Link href={routes.properties} className="flex items-center gap-2.5">
					<LogoMark />
					<span className="head hidden text-[17px] leading-none font-semibold sm:block">
						<BrandName />
					</span>
				</Link>
				<nav className="flex items-center gap-5 sm:gap-8">
					{navItems.map(({ href, label, className }) => (
						<Link
							key={href}
							className={cn("nav-link", className)}
							href={href}
							aria-current={pathname === href}
						>
							{label}
						</Link>
					))}
				</nav>
				<div className="flex items-center gap-2">
					{iconLinks.map(({ href, label, icon }) => (
						<Link
							key={href}
							href={href}
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
					<a href={routes.logout} className="btn btn-sm btn-soft" aria-label="Wyloguj się">
						<Icon icon={LogOut} className="text-[18px]" />
						<span className="hidden md:inline">Wyloguj</span>
					</a>
				</div>
			</div>
		</header>
	);
}
