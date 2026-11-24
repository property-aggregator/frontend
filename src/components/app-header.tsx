"use client";

import { Bell, Heart, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentProps, Suspense, useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { BrandName, LogoMark } from "@/components/logo";
import { FavoritesCountBadge } from "@/features/favorites/favorites-count";
import { UnreadNotificationsBadge } from "@/features/notifications/unread-count";
import { PremiumButton } from "@/features/plans/premium-button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: routes.properties, label: "Start" },
	{ href: routes.search, label: "Szukaj" },
	{ href: routes.deals, label: "Okazje" },
	{ href: routes.alerts, label: "Alerty" },
];

// On phones only the notifications and favorites icons stay in the bar; the rest moves into the menu.
const iconLinks = [
	{ href: routes.findByUrl, label: "Znajdź ofertę po linku", icon: Search, inMobileMenu: true },
	{ href: routes.notifications, label: "Powiadomienia", icon: Bell, inMobileMenu: false },
	{ href: routes.favorites, label: "Ulubione", icon: Heart, inMobileMenu: false },
	{ href: routes.account, label: "Konto", icon: UserRound, inMobileMenu: true },
];

const mobileMenuItems = [
	...navItems,
	...iconLinks.filter((link) => link.inMobileMenu),
	{ href: routes.premium, label: "Premium" },
];

type NavLinkProps = ComponentProps<typeof Link> & { href: string; current: "true" | "page" };

/** Reading the pathname blocks prerendering of dynamic routes, so it streams in behind a plain link. */
function NavLink({ current, ...props }: NavLinkProps) {
	return (
		<Suspense fallback={<Link {...props} />}>
			<CurrentAwareLink current={current} {...props} />
		</Suspense>
	);
}

function CurrentAwareLink({ current, ...props }: NavLinkProps) {
	const pathname = usePathname();
	return <Link {...props} aria-current={pathname === props.href ? current : undefined} />;
}

export function AppHeader() {
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
		const wide = window.matchMedia("(min-width: 48rem)");
		wide.addEventListener("change", close);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.body.style.overflow = overflow;
			wide.removeEventListener("change", close);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [menuOpen]);

	return (
		<header className="sticky top-0 z-50 border-b border-ink/[0.12] bg-white">
			<div className="mx-auto flex h-[76px] max-w-[1360px] items-center justify-between gap-4 px-6 sm:gap-6">
				<Link href={routes.properties} className="flex items-center gap-2.5">
					<LogoMark />
					<span className="head hidden text-[17px] leading-none font-semibold sm:block">
						<BrandName />
					</span>
				</Link>
				<nav className="hidden items-center gap-8 md:flex">
					{navItems.map(({ href, label }) => (
						<NavLink key={href} className="nav-link" href={href} current="true">
							{label}
						</NavLink>
					))}
				</nav>
				<div className="flex items-center gap-2">
					<PremiumButton onClick={() => setMenuOpen(false)} className="max-md:hidden" />
					{iconLinks.map(({ href, label, icon, inMobileMenu }) => (
						<NavLink
							key={href}
							href={href}
							onClick={() => setMenuOpen(false)}
							className={cn("btn btn-sm btn-soft relative px-3", inMobileMenu && "hidden md:inline-flex")}
							aria-label={label}
							title={label}
							current="page"
						>
							<Icon icon={icon} className="text-xl" />
							{href === routes.favorites && <FavoritesCountBadge />}
							{href === routes.notifications && <UnreadNotificationsBadge />}
						</NavLink>
					))}
					{/* Plain <a>: logout is an Auth0 route handler, so Link must not prefetch it. */}
					<a href={routes.logout} className="btn btn-sm btn-soft hidden md:inline-flex">
						<Icon icon={LogOut} className="text-xl" />
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
				className={cn(
					menuOpen ? "flex" : "hidden",
					// Under the header (76px and its line), down to the bottom of the screen.
					"fixed inset-x-0 top-[77px] bottom-0 flex-col overflow-y-auto bg-white px-6 py-4 md:hidden",
				)}
			>
				{mobileMenuItems.map(({ href, label }) => (
					<NavLink
						key={href}
						href={href}
						onClick={() => setMenuOpen(false)}
						current="page"
						className="head border-b border-line py-4 text-center text-base font-semibold text-ink uppercase"
					>
						{label}
					</NavLink>
				))}
				<div className="pt-6">
					<a href={routes.logout} className="btn btn-sm btn-soft w-full">
						<Icon icon={LogOut} className="text-xl" />
						Wyloguj
					</a>
				</div>
			</div>
		</header>
	);
}
