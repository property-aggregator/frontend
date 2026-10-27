import {
	BadgeCheck,
	ChartLine,
	Check,
	CircleHelp,
	Clock,
	Copy,
	LayoutDashboard,
	PanelsTopLeft,
	type LucideIcon,
	X,
	Zap,
} from "lucide-react";
import photo from "@/assets/landing/comparison.webp";
import { Icon } from "@/components/icon";
import { BrandName } from "@/components/logo";
import { BackgroundPhoto } from "@/components/background-photo";

type Item = { icon: LucideIcon; title: string; text: string };

const before: Item[] = [
	{
		icon: PanelsTopLeft,
		title: "Godziny na otwieraniu dziesiątek portali",
		text: "Ciągłe przełączanie między Otodom, OLX, Gratką i forami.",
	},
	{
		icon: Clock,
		title: "Spóźnione powiadomienia",
		text: "Alert po 2 godzinach, gdy mieszkanie jest już zarezerwowane.",
	},
	{
		icon: CircleHelp,
		title: "Brak wiedzy o historii cen",
		text: "Nie wiesz, czy sprzedający od pół roku bezskutecznie obniża cenę.",
	},
	{
		icon: Copy,
		title: "Zalew duplikatów",
		text: "Ta sama nieruchomość od 12 agencji, każda z inną ceną.",
	},
];

const after: Item[] = [
	{
		icon: LayoutDashboard,
		title: "Jeden pulpit bez duplikatów",
		text: "Powtórzone ogłoszenia scalone w jedną kartę ze wszystkimi kontaktami.",
	},
	{
		icon: Zap,
		title: "Alert SMS i e-mail poniżej 30 s",
		text: "O nowym lokalu lub spadku ceny wiesz pierwszy.",
	},
	{
		icon: ChartLine,
		title: "Pełna oś czasu zmian cen",
		text: "Historia korekt to twardy argument w negocjacjach.",
	},
	{
		icon: BadgeCheck,
		title: "Automatyczne wykrywanie okazji",
		text: "Stawka za m² porównana z cenami transakcyjnymi w dzielnicy.",
	},
];

export function Comparison() {
	return (
		<section id="porownanie" className="bg-mist py-20">
			<div className="mx-auto max-w-[1170px] px-6">
				<div className="reveal text-center">
					<h2 className="title">Koniec z odświeżaniem 20 kart</h2>
					<p className="mx-auto mt-3 max-w-[620px]">
						Zobacz różnicę między szukaniem na własną rękę a agregatorem, który pracuje za Ciebie 24/7.
					</p>
				</div>
				<div className="mt-12 grid gap-7 md:grid-cols-2">
					<div className="reveal rounded-xl border border-line bg-white p-8 md:p-10">
						<div className="flex items-center gap-4">
							<span className="grid h-12 w-12 place-items-center rounded-xl bg-mist text-body">
								<Icon icon={X} />
							</span>
							<div>
								<h3 className="text-[20px] font-bold">Tradycyjne szukanie</h3>
								<div className="text-[13px]">Chaotycznie i nieefektywnie</div>
							</div>
						</div>
						<ul className="mt-8 space-y-6">
							{before.map(({ icon, title, text }) => (
								<li key={title} className="flex gap-4">
									<Icon icon={icon} className="text-[#c9c3be]" />
									<div>
										<h4 className="text-[15px] font-medium">{title}</h4>
										<p className="mt-1">{text}</p>
									</div>
								</li>
							))}
						</ul>
					</div>
					<div className="reveal relative overflow-hidden rounded-xl bg-ink p-8 text-white/75 md:p-10">
						<BackgroundPhoto src={photo} darkness={0.92} sizes="(min-width: 768px) 560px, 100vw" />
						<div className="relative flex items-center gap-4">
							<span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-ink">
								<Icon icon={Check} />
							</span>
							<div>
								<h3 className="text-[20px] font-bold text-white">
									Z <BrandName />
								</h3>
								<div className="text-[13px] text-white/60">Pełna kontrola rynku</div>
							</div>
						</div>
						<ul className="relative mt-8 space-y-6">
							{after.map(({ icon, title, text }) => (
								<li key={title} className="flex gap-4">
									<Icon icon={icon} className="text-white" />
									<div>
										<h4 className="text-[15px] font-medium text-white">{title}</h4>
										<p className="mt-1">{text}</p>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
