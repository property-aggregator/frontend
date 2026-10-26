import { BellRing, ChartLine, FileCheck, Map as MapIcon, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const portals = ["Nieruchomości-online", "OLX", "Otodom", "Morizon"];

const features: { icon: LucideIcon; title: string; text: string; tile: string }[] = [
	{
		icon: ChartLine,
		title: "Historia cen",
		text: "Każda korekta ceny na wykresie. Negocjujesz z twardymi argumentami.",
		tile: "bg-pastel-blue",
	},
	{
		icon: BellRing,
		title: "Alerty <30 s",
		text: "SMS lub e-mail od razu po publikacji albo obniżce ceny.",
		tile: "bg-pastel-peach",
	},
	{
		icon: MapIcon,
		title: "Własny obszar",
		text: "Rysujesz obszar na mapie lub wybierasz promień i czas dojazdu.",
		tile: "bg-pastel-violet",
	},
	{
		icon: FileCheck,
		title: "Ceny RCN",
		text: "Porównanie z cenami z aktów notarialnych i automatyczne okazje.",
		tile: "bg-pastel-plum",
	},
];

export function Portals() {
	return (
		<div className="mt-14 overflow-hidden" aria-label="Przeszukiwane portale">
			<div className="head mx-auto flex max-w-[1170px] flex-wrap justify-center gap-x-14 gap-y-3 px-6 text-[20px] font-bold text-[#b9c2c7]">
				{portals.map((portal) => (
					<span key={portal}>{portal}</span>
				))}
			</div>
		</div>
	);
}

export function Features() {
	return (
		<section id="funkcje" className="py-20">
			<div className="mx-auto max-w-[1170px] px-6">
				<h2 className="title text-center">Szukasz szybciej, kupujesz taniej</h2>
				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{features.map(({ icon, title, text, tile }) => (
						<article key={title} className={cn("reveal rounded-xl p-7", tile)}>
							<span className="grid h-14 w-14 place-items-center rounded-lg bg-white">
								<Icon icon={icon} className="text-[30px] text-ink" />
							</span>
							<h4 className="mt-5 text-[17px] font-bold">{title}</h4>
							<p className="mt-2">{text}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
