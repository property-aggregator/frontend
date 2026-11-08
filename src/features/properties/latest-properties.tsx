import { io } from "next/cache";
import { Suspense } from "react";
import { Carousel, CarouselSkeleton } from "@/components/carousel";
import { getLatestProperties, type Property } from "@/features/properties/api";
import { PropertyCard } from "@/features/properties/property-card";
import { cn } from "@/lib/utils";

async function loadLatest(): Promise<Property[] | null> {
	try {
		return await getLatestProperties();
	} catch (error) {
		console.error("Failed to load the latest properties", error);
		return null;
	}
}

type LatestPropertiesProps = { className?: string };

export function LatestProperties(props: LatestPropertiesProps) {
	return (
		<Suspense
			fallback={
				<div className={props.className}>
					<CarouselSkeleton height="h-[380px]" />
				</div>
			}
		>
			<LatestList {...props} />
		</Suspense>
	);
}

async function LatestList({ className }: LatestPropertiesProps) {
	// io() keeps the API call out of the build, so the page builds without the backend running.
	await io();
	const properties = await loadLatest();

	if (!properties || properties.length === 0) {
		return (
			<p className={cn("rounded-xl bg-white p-8 text-center", className)}>
				{properties
					? "Nie ma jeszcze żadnych ofert."
					: "Nie udało się pobrać ofert. Spróbuj ponownie za chwilę."}
			</p>
		);
	}

	return (
		<div className={className}>
			<Carousel label="Najnowsze oferty">
				{properties.map((property) => (
					<PropertyCard key={property.id} property={property} />
				))}
			</Carousel>
		</div>
	);
}
