import heroPhoto from "@/assets/landing/hero.webp";
import { BrandName } from "@/components/logo";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";
import { BackgroundPhoto } from "@/components/background-photo";
import { WordRotator } from "./word-rotator";

export function Hero() {
	return (
		<section id="top" className="relative overflow-hidden bg-ink text-white">
			<BackgroundPhoto src={heroPhoto} darkness={0.9} priority />
			<div className="relative mx-auto grid max-w-[1170px] items-center gap-10 px-6 pt-20 pb-20 md:pt-24 md:pb-24 lg:grid-cols-[1fr_1.05fr]">
				<div>
					<div className="title-sub flex items-center gap-2 text-white/80">
						300+ portali · 25 000 nowych ofert dziennie
					</div>
					<h1 className="mt-3 text-[34px] leading-[1.15] font-bold text-white md:text-[50px]">
						Znajdź <WordRotator words={["mieszkanie", "dom", "okazję −19%", "inwestycję"]} />
						<br />
						zanim zrobią to inni
					</h1>
					<p className="mt-5 max-w-[520px] text-[15px] text-white/85">
						Otodom, OLX, Morizon, Gratka i wiele innych portali naraz. Bez duplikatów, z historią cen i
						alertem o okazji w mniej niż 10 minut.
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<a href={routes.signupPage} className="btn btn-slate hover:bg-white hover:text-ink">
							Wypróbuj za darmo
						</a>
						<a href="#porownanie" className="btn btn-ghost">
							Zobacz różnicę
						</a>
					</div>
				</div>

				<DashboardMockup />
			</div>
		</section>
	);
}

function DashboardMockup() {
	return (
		<div className="relative hidden h-[400px] lg:block" aria-hidden="true">
			<div className="absolute top-0 right-0 w-[440px] origin-top-right scale-[1.25] overflow-hidden rounded-xl bg-white text-ink ring-1 ring-white/25">
				<div className="flex h-7 items-center gap-1.5 bg-mist px-3">
					<span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
					<span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
					<span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
					<span className="ml-3 flex-1 bg-white px-2 py-0.5 text-[9px] text-body">{site.domain}/pulpit</span>
				</div>
				<div className="head flex h-9 items-center justify-between border-b border-line px-3 text-[10px]">
					<b className="font-semibold">
						<BrandName />
					</b>
					<span className="flex gap-3">
						<span className="border-b-2 border-ink">Oferty</span>
						<span>Mapa</span>
						<span>Alerty</span>
					</span>
				</div>
				<div className="flex h-[250px]">
					<div className="w-[200px] space-y-2 p-2.5">
						<div className="flex gap-1 text-[8px]">
							<span className="bg-ink px-1.5 py-0.5 text-white">Mokotów</span>
							<span className="bg-mist px-1.5 py-0.5">45–65 m²</span>
							<span className="bg-mist px-1.5 py-0.5">do 750 tys.</span>
						</div>
						<div className="flex gap-2 border border-brand/30 bg-tint p-1.5">
							<div className="h-10 w-12 shrink-0 bg-line" />
							<div className="text-[8px] leading-tight">
								<b className="text-brand uppercase">Okazja −19%</b>
								<div className="head text-[9px]">3 pokoje, Puławska</div>
								<b className="head text-[10px]">649 000 zł</b>
							</div>
						</div>
						<div className="flex gap-2 bg-mist p-1.5">
							<div className="h-10 w-12 shrink-0 bg-line" />
							<div className="text-[8px] leading-tight">
								<b className="uppercase">Nowość · 1 min</b>
								<div className="head text-[9px]">Kawalerka, Ochota</div>
								<b className="head text-[10px]">410 000 zł</b>
							</div>
						</div>
						<div className="border border-line p-1.5">
							<div className="flex justify-between text-[8px]">
								<span>Historia ceny</span>
								<b className="text-brand">−12,3%</b>
							</div>
							<svg className="h-8 w-full" viewBox="0 0 200 40" preserveAspectRatio="none">
								<path
									d="M0,6 H50 V14 H110 V24 H160 V34 H200 V40 H0Z"
									fill="#0a8350"
									fillOpacity=".15"
								/>
								<path
									d="M0,6 H50 V14 H110 V24 H160 V34 H200"
									fill="none"
									stroke="#0a8350"
									strokeWidth="2"
								/>
							</svg>
						</div>
					</div>
					<div className="relative flex-1 overflow-hidden bg-[#eceef3]">
						<svg
							className="absolute inset-0 h-full w-full"
							viewBox="0 0 240 250"
							preserveAspectRatio="xMidYMid slice"
						>
							<path
								d="M-10,190 C50,170 100,210 150,185 S220,170 250,180 L250,260 L-10,260Z"
								fill="#b8daf7"
							/>
							<g stroke="#fff" fill="none" strokeWidth="7">
								<path d="M0,60 L240,80" />
								<path d="M0,140 L240,120" />
								<path d="M70,0 L85,250" />
								<path d="M160,0 L150,250" />
							</g>
							<path
								d="M30,50 L130,62 L135,140 L60,155 L22,110Z"
								fill="#576696"
								fillOpacity=".2"
								stroke="#576696"
								strokeWidth="1.5"
								strokeDasharray="5 4"
							/>
						</svg>
						<span className="head absolute top-[80px] left-[40px] bg-brand px-1.5 py-0.5 text-[8px] text-white">
							649k
						</span>
						<span className="head absolute top-[115px] left-[80px] bg-ink px-1.5 py-0.5 text-[8px] text-white">
							559k
						</span>
						<span className="absolute top-2 left-2 bg-white px-1.5 py-0.5 text-[8px]">
							142 oferty w obszarze
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
