"use client";

import { Check, House, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Icon } from "@/components/icon";
import { PriceChangeText } from "@/features/properties/price-change-pill";
import { areaFormat, fullAddress, priceFormat } from "@/features/properties/property-card";
import { propertyUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { loadOlderNotifications } from "./actions";
import type { Notification, NotificationsPage } from "./api";
import { useAdjustUnreadCount } from "./unread-count";

const timeZone = "Europe/Warsaw";
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone });
const timeFormat = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone });
const dayFormat = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", timeZone });
const dayWithYearFormat = new Intl.DateTimeFormat("pl-PL", {
	day: "numeric",
	month: "short",
	year: "numeric",
	timeZone,
});
const fullFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeStyle: "short", timeZone });

/** Today just the hour, e.g. "14:05"; earlier the day, e.g. "12 lis", with the year if not this one. */
function ReceivedAt({ date }: { date: string }) {
	const received = new Date(date);
	const now = new Date();
	const text =
		dayKeyFormat.format(received) === dayKeyFormat.format(now)
			? timeFormat.format(received)
			: dayKeyFormat.format(received).slice(0, 4) === dayKeyFormat.format(now).slice(0, 4)
				? dayFormat.format(received)
				: dayWithYearFormat.format(received);

	// The day may change between the server render and hydration.
	return (
		<time dateTime={date} title={fullFormat.format(received)} suppressHydrationWarning>
			{text}
		</time>
	);
}

/** `alertName` is shown in bold after the text. */
function describe(notification: Notification): { text: string; alertName?: string } {
	switch (notification.type) {
		case "searchAlertMatch":
			return { text: "Nowa oferta z alertu", alertName: notification.searchAlert?.name };
		case "favoritePriceChange":
			return { text: "Zmiana ceny ulubionej oferty" };
		case "favoriteArchived":
			return { text: "Ulubiona oferta wygasła" };
		case "favoriteRestored":
			return { text: "Ulubiona oferta znów jest aktualna" };
	}
}

export function NotificationsList({ initialPage }: { initialPage: NotificationsPage }) {
	const [notifications, setNotifications] = useState(initialPage.items);
	const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
	const [loadError, setLoadError] = useState<string>();
	const [loading, startLoading] = useTransition();
	const adjustUnreadCount = useAdjustUnreadCount();

	function setRead(id: string, isRead: boolean) {
		setNotifications((current) =>
			current.map((notification) => (notification.id === id ? { ...notification, isRead } : notification)),
		);
	}

	// Optimistic: the badge and the list change at once, and change back if the API refuses.
	// keepalive: the request outlives the page when it is sent on the way to the offer.
	async function read(notification: Notification) {
		if (notification.isRead) {
			return;
		}
		setRead(notification.id, true);
		adjustUnreadCount(-1);
		const response = await fetch(`/api/notifications/${notification.id}/read`, {
			method: "PUT",
			keepalive: true,
		}).catch(() => null);
		if (!response?.ok) {
			setRead(notification.id, false);
			adjustUnreadCount(1);
		}
	}

	function loadOlder() {
		if (!nextCursor) {
			return;
		}
		startLoading(async () => {
			const { page, error } = await loadOlderNotifications(nextCursor);
			setLoadError(error);
			if (page) {
				setNotifications((current) => [...current, ...page.items]);
				setNextCursor(page.nextCursor);
			}
		});
	}

	return (
		<>
			{/* As in mobile apps: rows split by lines, no gaps. On phones from edge to edge of the screen,
			    from tablets in a box with rounded corners. */}
			<ul className="grid border-t border-line max-sm:-mx-3 sm:rounded-xl sm:border">
				{notifications.map((notification) => (
					<NotificationItem
						key={notification.id}
						notification={notification}
						onRead={() => read(notification)}
					/>
				))}
			</ul>
			{nextCursor && (
				<div className="mt-8 grid justify-items-center gap-2">
					<button type="button" onClick={loadOlder} disabled={loading} className="btn btn-sm btn-soft">
						{loading ? "Wczytywanie…" : "Pokaż starsze"}
					</button>
					{loadError && (
						<p role="alert" className="text-sm text-price-up">
							{loadError}
						</p>
					)}
				</div>
			)}
		</>
	);
}

function NotificationItem({ notification, onRead }: { notification: Notification; onRead: () => void }) {
	const { property } = notification;
	const { text, alertName } = describe(notification);
	const address = fullAddress(property);
	const read = notification.isRead;

	return (
		<li
			className={cn(
				// min-w-0: as a grid item it would otherwise grow to fit its untruncated texts.
				// On phones a grid: the thumbnail with the heading beside it, the property's details under both.
				// The first and last rows follow the box's corners: its radius less its border.
				"relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-line p-3 sm:flex sm:gap-4 sm:p-4 sm:first:rounded-t-[11px] sm:last:rounded-b-[11px] sm:last:border-b-0",
				read ? "bg-[#f5f6f8]" : "bg-white",
			)}
		>
			<div className="relative aspect-[4/3] w-24 shrink-0 self-start overflow-hidden rounded-lg bg-mist sm:aspect-[3/2] sm:w-56">
				{property.mainImageUrl ? (
					<Image
						className={cn("object-cover", read && "opacity-80")}
						src={property.mainImageUrl}
						alt=""
						fill
						unoptimized
					/>
				) : (
					<div className="absolute inset-0 grid place-items-center rounded-lg border border-line bg-white text-line">
						<Icon icon={House} className="text-[28px] sm:text-[48px]" />
					</div>
				)}
			</div>
			<div className="contents sm:flex sm:min-w-0 sm:flex-1 sm:flex-col">
				<div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
					<p
						className={cn(
							"head line-clamp-3 min-w-0 text-base leading-snug sm:text-lg",
							read ? "font-normal text-[#64748b]" : "font-semibold text-ink",
						)}
					>
						{text}
						{alertName && <span className={read ? "font-medium" : "font-bold"}> „{alertName}”</span>}
					</p>
					<p
						className={cn(
							"flex shrink-0 items-center gap-1.5 pt-0.5 text-xs whitespace-nowrap sm:pt-1 sm:text-sm",
							read ? "text-[#64748b]" : "font-semibold text-ink",
						)}
					>
						<ReceivedAt date={notification.createdAt} />
						{!read && (
							<span className="size-2 rounded-full bg-[#2e3748]">
								<span className="sr-only">Nieprzeczytane</span>
							</span>
						)}
					</p>
				</div>
				<div className="col-span-2 flex min-w-0 flex-1 flex-col">
					<h2
						className={cn(
							"truncate text-sm leading-snug sm:mt-1.5 sm:text-md",
							read ? "font-normal text-[#64748b]" : "font-semibold text-ink",
						)}
					>
						<Link
							href={propertyUrl(property.id)}
							// Once Link has started the navigation, so the offer opens first.
							onClick={() => setTimeout(onRead)}
							className="after:absolute after:inset-0"
						>
							{property.title}
						</Link>
					</h2>
					{address && (
						<p
							className={cn(
								"mt-1 flex items-center gap-1 text-xs sm:text-sm",
								read ? "text-[#64748b]" : "font-semibold text-ink",
							)}
						>
							<Icon icon={MapPin} className="shrink-0 text-base text-muted sm:text-lg" />
							<span className="truncate">{address}</span>
						</p>
					)}
					<div className="mt-auto flex items-end justify-between gap-2 pt-2 sm:gap-3">
						<p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-2.5">
							<span className={cn("head text-md font-bold sm:text-lg", read ? "text-body" : "text-ink")}>
								{property.price === null ? "Zapytaj o cenę" : priceFormat.format(property.price)}
							</span>
							{property.areaM2 !== null && (
								<span
									className={cn(
										"head text-sm font-semibold sm:text-md",
										read ? "text-body" : "text-ink",
									)}
								>
									{areaFormat.format(property.areaM2)} m²
								</span>
							)}
							{notification.type === "favoritePriceChange" && (
								<PriceChangeText
									amount={notification.priceChangeAmount}
									percent={notification.priceChangePercent}
								/>
							)}
						</p>
						{!read && (
							<button
								type="button"
								onClick={onRead}
								aria-label="Oznacz jako przeczytane"
								title="Oznacz jako przeczytane"
								className="relative z-10 grid size-8 shrink-0 cursor-pointer place-items-center rounded-md border border-line bg-white text-muted transition-colors hover:border-ink/30 hover:bg-mist hover:text-ink"
							>
								<Icon icon={Check} className="text-lg" />
							</button>
						)}
					</div>
				</div>
			</div>
		</li>
	);
}
