"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { preconnect } from "react-dom";
import { useOverscrollBounce } from "@/components/carousel";
import type { Transaction } from "@/features/properties/api";
import { areaFormat, priceFormat, roomsText } from "@/features/properties/property-card";
import { marketLabels } from "@/features/properties/search-params";
import { cn } from "@/lib/utils";

const TILES_ORIGIN = "https://tiles.openfreemap.org";
const MAP_STYLE = `${TILES_ORIGIN}/styles/liberty`;

// MapLibre derives the worker url at runtime, so the bundler would never emit the file; vector tiles need it.
const workerUrl = () => new URL("../../../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href;

const mapLocale = {
	"NavigationControl.ZoomIn": "Przybliż",
	"NavigationControl.ZoomOut": "Oddal",
	"AttributionControl.ToggleAttribution": "Pokaż źródła mapy",
	"CooperativeGesturesHandler.WindowsHelpText": "Użyj Ctrl + kółka myszy, aby przybliżyć mapę",
	"CooperativeGesturesHandler.MacHelpText": "Użyj ⌘ + kółka myszy, aby przybliżyć mapę",
	"CooperativeGesturesHandler.MobileHelpText": "Przesuń mapę dwoma palcami",
};

const compactPriceFormat = new Intl.NumberFormat("pl-PL", { notation: "compact", maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeZone: "Europe/Warsaw" });

function distanceText(meters: number): string {
	return meters < 1000 ? `${meters} m` : `${areaFormat.format(Math.round(meters / 100) / 10)} km`;
}

/** RCN counts "izby", which include the kitchen, so a flat of more than one has one room fewer. */
function roomsFromChambers(chambers: number): number {
	return chambers > 1 ? chambers - 1 : chambers;
}

/** RCN gives the storey ("kondygnacja"), where the ground floor is 1. */
function floorFromStorey(storey: number): string {
	const floor = storey - 1;
	return floor < 0 ? "suterena" : floor === 0 ? "parter" : `${floor} piętro`;
}

function transactionMarker(transaction: Transaction, onClick: () => void): HTMLElement {
	// MapLibre positions the marker element with a transform, so the visuals that scale live in its children.
	const marker = document.createElement("button");
	marker.type = "button";
	marker.className = "group cursor-pointer p-1";
	marker.setAttribute("aria-label", `Transakcja za ${priceFormat.format(transaction.price)}`);
	marker.innerHTML = `
		<span class="block size-3.5 rounded-full border-2 border-white bg-slate shadow-[0_1px_4px_rgb(23_38_46/0.4)] transition-transform group-hover:scale-125 group-data-[active=true]:scale-150 group-data-[active=true]:bg-ink"></span>
		<span class="head absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded bg-ink px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap text-white group-data-[active=true]:block">${compactPriceFormat.format(transaction.price)} zł</span>
	`;
	marker.addEventListener("click", (event) => {
		event.stopPropagation();
		onClick();
	});
	return marker;
}

function highlightMarker(markers: Map<string, HTMLElement>, activeId: string) {
	for (const [id, marker] of markers) {
		marker.dataset.active = String(id === activeId);
		marker.style.zIndex = id === activeId ? "1" : "";
	}
}

function originMarker(): HTMLElement {
	const marker = document.createElement("div");
	marker.innerHTML = `
		<span class="block size-5 rounded-full border-[3px] border-white bg-pastel-red shadow-[0_1px_6px_rgb(23_38_46/0.5)]"></span>
		<span class="head absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-white px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap text-ink shadow">Ta oferta</span>
	`;
	return marker;
}

type TransactionsMapProps = {
	transactions: Transaction[];
	latitude: number | null;
	longitude: number | null;
	showDistance: boolean;
};

export function TransactionsMap({ transactions, latitude, longitude, showDistance }: TransactionsMapProps) {
	const container = useRef<HTMLDivElement>(null);
	const { ref: list, handlers: listHandlers } = useOverscrollBounce<HTMLUListElement>();
	const map = useRef<MapLibreMap | null>(null);
	const markers = useRef(new Map<string, HTMLElement>());
	const items = useRef(new Map<string, HTMLElement>());
	const [activeId, setActiveId] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);
	preconnect(TILES_ORIGIN);

	useEffect(() => {
		const element = container.current;
		if (!element) {
			return;
		}
		let cancelled = false;
		let instance: MapLibreMap | null = null;

		function selectFromMap(id: string) {
			setActiveId(id);
			highlightMarker(markers.current, id);
			const item = items.current.get(id);
			const element = list.current;
			if (!item || !element) {
				return;
			}
			// A row of cards on phones, a column next to the map on desktops.
			if (element.scrollWidth > element.clientWidth) {
				element.scrollTo({ left: item.offsetLeft - 12, behavior: "smooth" });
			} else {
				element.scrollTo({
					top: item.offsetTop - (element.clientHeight - item.clientHeight) / 2,
					behavior: "smooth",
				});
			}
		}

		async function createMap() {
			try {
				const { Map: MapLibre, Marker, NavigationControl, setWorkerUrl } = await import("maplibre-gl");
				if (cancelled || !element) {
					return;
				}
				setWorkerUrl(workerUrl());
				const points: [number, number][] = transactions.map(({ longitude, latitude }) => [longitude, latitude]);
				if (latitude !== null && longitude !== null) {
					points.push([longitude, latitude]);
				}
				const lngs = points.map(([lng]) => lng);
				const lats = points.map(([, lat]) => lat);

				instance = new MapLibre({
					container: element,
					style: MAP_STYLE,
					bounds: [
						[Math.min(...lngs), Math.min(...lats)],
						[Math.max(...lngs), Math.max(...lats)],
					],
					fitBoundsOptions: { padding: 48, maxZoom: 16 },
					cooperativeGestures: true,
					attributionControl: { compact: true },
					locale: mapLocale,
				});
				instance.addControl(new NavigationControl({ showCompass: false }), "top-right");
				// Fitting every transaction leaves the offer small, so start one level closer, centred on it.
				instance.jumpTo({
					center: latitude !== null && longitude !== null ? [longitude, latitude] : undefined,
					zoom: Math.min(instance.getZoom() + 1, 17),
				});
				map.current = instance;

				for (const transaction of transactions) {
					const marker = transactionMarker(transaction, () => selectFromMap(transaction.transactionId));
					markers.current.set(transaction.transactionId, marker);
					new Marker({ element: marker })
						.setLngLat([transaction.longitude, transaction.latitude])
						.addTo(instance);
				}
				if (latitude !== null && longitude !== null) {
					new Marker({ element: originMarker() }).setLngLat([longitude, latitude]).addTo(instance);
				}
			} catch (error) {
				console.error("Failed to load the map", error);
				if (!cancelled) {
					setFailed(true);
				}
			}
		}

		void createMap();

		const markerElements = markers.current;
		return () => {
			cancelled = true;
			instance?.remove();
			map.current = null;
			markerElements.clear();
		};
	}, [transactions, latitude, longitude, list]);

	function activate(id: string) {
		setActiveId(id);
		highlightMarker(markers.current, id);
	}

	function selectFromList(transaction: Transaction) {
		activate(transaction.transactionId);
		map.current?.flyTo({
			center: [transaction.longitude, transaction.latitude],
			zoom: Math.max(map.current.getZoom(), 15),
		});
	}

	return (
		<div className="grid gap-1 lg:grid-cols-[1fr_380px] lg:gap-5">
			{/* The padding keeps the hover shadow of the tiles from being clipped by the scrolling list. */}
			<ul
				ref={list}
				{...listHandlers}
				className="scroll-thin relative order-last max-lg:-mx-3 max-lg:flex max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-3 max-lg:[scrollbar-width:none] max-lg:gap-4 max-lg:overflow-x-auto max-lg:p-3 lg:-my-2.5 lg:-ml-3 lg:grid lg:max-h-[580px] lg:grid-cols-[minmax(0,1fr)] lg:content-start lg:gap-3 lg:overflow-y-auto lg:pt-2.5 lg:pr-1.5 lg:pb-2.5 lg:pl-3 max-lg:[&::-webkit-scrollbar]:hidden lg:[&::-webkit-scrollbar-track]:[margin-block:10px]"
			>
				{transactions.map((transaction) => {
					const details = [
						transaction.areaM2 === null ? null : `${areaFormat.format(transaction.areaM2)} m²`,
						transaction.rooms === null ? null : roomsText(roomsFromChambers(transaction.rooms)),
						transaction.floor === null ? null : floorFromStorey(transaction.floor),
						transaction.marketType && `rynek ${marketLabels[transaction.marketType].toLowerCase()}`,
					].filter(Boolean);
					const distance =
						showDistance && transaction.distanceMeters !== null
							? `${distanceText(transaction.distanceMeters)} od oferty`
							: null;

					return (
						<li
							key={transaction.transactionId}
							ref={(item) => {
								if (item) {
									items.current.set(transaction.transactionId, item);
								} else {
									items.current.delete(transaction.transactionId);
								}
							}}
							className="max-lg:w-[80%] max-lg:shrink-0 max-lg:snap-start sm:max-lg:w-[calc((100%-16px)/2)]"
						>
							<button
								type="button"
								onClick={() => selectFromList(transaction)}
								onMouseEnter={() => activate(transaction.transactionId)}
								aria-pressed={activeId === transaction.transactionId}
								className={cn(
									"block h-full w-full cursor-pointer rounded-xl bg-white px-5 py-3.5 text-left transition-[background-color,box-shadow] hover:shadow-[0_4px_6px_-1px_rgb(0_0_0/0.1),0_-4px_6px_-1px_rgb(0_0_0/0.1),0_2px_4px_-2px_rgb(0_0_0/0.1),0_-2px_4px_-2px_rgb(0_0_0/0.1)]",
									activeId === transaction.transactionId &&
										"bg-mist shadow-[0_4px_6px_-1px_rgb(0_0_0/0.1),0_-4px_6px_-1px_rgb(0_0_0/0.1),0_2px_4px_-2px_rgb(0_0_0/0.1),0_-2px_4px_-2px_rgb(0_0_0/0.1)]",
								)}
							>
								<span className="flex items-baseline justify-between gap-3">
									<span className="head text-[17px] font-bold">
										{priceFormat.format(transaction.price)}
									</span>
									{transaction.pricePerM2 !== null && (
										<span className="text-[13px] text-muted">
											{priceFormat.format(transaction.pricePerM2)}/m²
										</span>
									)}
								</span>
								<span className="block truncate text-[14px]">
									{transaction.address ?? "Adres nieznany"}
								</span>
								{details.length > 0 && <span className="block text-[13px]">{details.join(" • ")}</span>}
								{(transaction.date || distance) && (
									<span className="block text-[12px] text-body">
										{transaction.date && (
											<time dateTime={transaction.date} className="font-semibold text-ink">
												{dateFormat.format(new Date(transaction.date))}
											</time>
										)}
										{transaction.date && distance && " • "}
										{distance}
									</span>
								)}
							</button>
						</li>
					);
				})}
			</ul>
			<div className="relative isolate h-[340px] overflow-hidden rounded-xl bg-white lg:h-[560px]">
				<div ref={container} className="h-full w-full" />
				{failed && (
					<p className="absolute inset-0 grid place-items-center p-6 text-center">
						Nie udało się wczytać mapy. Spróbuj odświeżyć stronę.
					</p>
				)}
			</div>
		</div>
	);
}
