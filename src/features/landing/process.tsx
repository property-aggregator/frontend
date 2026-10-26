import { ArrowRight, HousePlus, TrendingDown } from "lucide-react";
import processPhoto from "@/assets/landing/process.webp";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { BackgroundPhoto } from "./background-photo";

const steps = [
	"Ustawiasz kryteria: lokalizację, metraż i budżet.",
	"Przeszukujemy ponad 300 portali co 15 sekund.",
	"Scalamy duplikaty w jedną kartę oferty.",
	"Porównujemy cenę z RCN i historią korekt.",
	"Oznaczamy okazje poniżej średniej rynkowej.",
	"Wysyłamy alert, a Ty dzwonisz jako pierwszy.",
];

export function Process() {
	return (
		<section id="proces" className="relative overflow-hidden bg-ink py-20 text-white">
			<BackgroundPhoto src={processPhoto} darkness={0.88} parallax />
			<div className="relative mx-auto grid max-w-[1170px] items-center gap-12 px-6 lg:grid-cols-[1fr_auto_1.1fr]">
				<div className="reveal">
					<div className="title-sub text-white/80">Jak to działa</div>
					<h2 className="mt-2 text-[38px] leading-[1.1] font-bold text-white md:text-[54px]">
						Dzwoń pierwszy.
						<br />
						Kupuj taniej.
					</h2>
					<p className="mt-6 max-w-[460px] text-[15px] text-white/90">
						Od publikacji ogłoszenia do powiadomienia na Twoim telefonie mija mniej niż pół minuty. Oto, co
						dzieje się po drodze.
					</p>
					<a href="#cennik" className="btn btn-ghost mt-8">
						Wypróbuj za 0 zł <Icon icon={ArrowRight} className="text-[18px]" />
					</a>
				</div>

				<PhoneMockup />

				<ol className="reveal">
					{steps.map((step, index) => {
						const last = index === steps.length - 1;
						return (
							<li
								key={step}
								className={cn("flex items-center gap-5 py-4", !last && "border-b border-white/20")}
							>
								<span
									className={cn(
										"head grid h-11 w-11 shrink-0 place-items-center rounded-md",
										"bg-white text-ink",
										last && "font-bold",
									)}
								>
									{index + 1}
								</span>
								<span className={cn("text-[17px]", last && "font-medium")}>{step}</span>
							</li>
						);
					})}
				</ol>
			</div>
		</section>
	);
}

function PhoneMockup() {
	return (
		<div
			className="reveal mx-auto hidden h-[370px] w-[180px] rounded-[30px] bg-[#111] p-1.5 ring-1 ring-white/25 lg:block"
			aria-hidden="true"
		>
			<div className="h-full overflow-hidden rounded-[25px] bg-mist text-ink">
				<div className="head flex h-7 items-center justify-between px-4 text-[9px]">
					<span>9:41</span>
					<span className="h-3.5 w-12 rounded-full bg-[#111]" />
					<span>5G</span>
				</div>
				<div className="head px-3 py-1.5 text-[12px] font-medium">Alerty</div>
				<div className="space-y-1.5 px-2.5">
					<div className="flex items-center gap-1.5 bg-white p-2">
						<span className="grid h-6 w-6 place-items-center bg-tint text-brand">
							<Icon icon={TrendingDown} className="text-[14px]" />
						</span>
						<div className="text-[8px] leading-tight">
							<b className="head text-[9px] font-medium">−85 000 zł · Wola</b>
							<br />
							28 s temu
						</div>
					</div>
					<div className="bg-white">
						<div className="h-[90px] w-full bg-line" />
						<div className="p-2">
							<div className="head text-[10px] font-medium">3 pokoje, Puławska</div>
							<b className="head text-[12px] font-medium text-brand">649 000 zł</b>
						</div>
					</div>
					<div className="flex items-center gap-1.5 bg-white p-2">
						<span className="grid h-6 w-6 place-items-center bg-ink text-white">
							<Icon icon={HousePlus} className="text-[14px]" />
						</span>
						<div className="text-[8px] leading-tight">
							<b className="head text-[9px] font-medium">Nowa · Ochota</b>
							<br />
							410 000 zł
						</div>
					</div>
					<div className="head bg-ink py-2 text-center text-[10px] text-white">Zadzwoń teraz</div>
				</div>
			</div>
		</div>
	);
}
