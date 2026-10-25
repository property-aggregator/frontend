import { Comparison } from "@/features/landing/comparison";
import { Contact } from "@/features/landing/contact";
import { Features, Portals } from "@/features/landing/features";
import { Hero } from "@/features/landing/hero";
import { LatestOffers } from "@/features/landing/latest-offers";
import { MapSection } from "@/features/landing/map-section";
import { Pricing } from "@/features/landing/pricing";
import { Process } from "@/features/landing/process";
import { RevealOnScroll } from "@/features/landing/reveal-on-scroll";
import { SiteFooter } from "@/features/landing/site-footer";
import { SiteHeader } from "@/features/landing/site-header";
import { Stats } from "@/features/landing/stats";

export default function HomePage() {
	return (
		<>
			<SiteHeader />
			<main>
				<Hero />
				<Portals />
				<Features />
				<Comparison />
				<LatestOffers />
				<Stats />
				<MapSection />
				<Process />
				<Pricing />
				<Contact />
			</main>
			<SiteFooter />
			<RevealOnScroll />
		</>
	);
}
