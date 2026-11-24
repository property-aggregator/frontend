import { BellRing, ChartLine, FileCheck, Map as MapIcon, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const portals = ["Nieruchomości-online", "OLX", "Otodom", "Morizon", "Gratka", "Domiporta", "Lento"];

const features: { icon: LucideIcon; title: string; text: string; border: string; iconBg: string }[] = [
	{
		icon: ChartLine,
		title: "Historia cen",
		text: "Każda korekta ceny na wykresie. Negocjujesz z twardymi argumentami.",
		border: "border-pastel-blue",
		iconBg: "bg-pastel-blue",
	},
	{
		icon: BellRing,
		title: "Alerty",
		text: "Błyskawiczny SMS lub e-mail po publikacji ogłoszenia.",
		border: "border-pastel-peach",
		iconBg: "bg-pastel-peach",
	},
	{
		icon: MapIcon,
		title: "Własny obszar",
		text: "Rysujesz obszar na mapie lub wybierasz promień i czas dojazdu.",
		border: "border-pastel-violet",
		iconBg: "bg-pastel-violet",
	},
	{
		icon: FileCheck,
		title: "Ceny RCN",
		text: "Porównanie z cenami z aktów notarialnych i automatyczne okazje.",
		border: "border-pastel-plum",
		iconBg: "bg-pastel-plum",
	},
];

export function Portals() {
	return (
		<div className="mt-14 overflow-hidden px-6 text-center" aria-label="Przeszukiwane portale">
			<div className="head relative mx-auto mt-4 max-w-292.5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] md:[mask-image:none] md:[-webkit-mask-image:none]">
				<div className="flex w-max animate-[marquee_22s_linear_infinite] hover:[animation-play-state:paused] md:w-full md:animate-none md:justify-center">
					{[0, 1].map((group) => (
						<div
							key={group}
							aria-hidden={group === 1}
							className={cn(
								"flex shrink-0 items-center gap-x-10 pr-10 text-xl font-bold text-[#b9c2c7] md:shrink md:flex-wrap md:justify-center md:gap-x-12 md:gap-y-3 md:pr-0 md:text-2xl",
								group === 1 && "md:hidden",
							)}
						>
							{portals.map((portal) => (
								<span key={`${group}-${portal}`} className="whitespace-nowrap">
									{portal}
								</span>
							))}
						</div>
					))}
				</div>
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
					{features.map(({ icon, title, text, border, iconBg }) => (
						<article key={title} className={cn("reveal rounded-lg border-2 bg-white p-6", border)}>
							<span className={cn("grid h-14 w-14 place-items-center rounded-lg", iconBg)}>
								<Icon icon={icon} className="text-5xl text-ink" />
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
