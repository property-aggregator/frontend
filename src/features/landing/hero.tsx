import Image from "next/image";
import illustration from "@/assets/landing/hero-illustration.svg";
import illustrationMobile from "@/assets/landing/hero-illustration-mobile.svg";
import { routes } from "@/lib/routes";
import { WordRotator } from "./word-rotator";

export function Hero() {
	return (
		<section id="top" className="bg-mist">
			<div className="mx-auto grid max-w-[1170px] items-center gap-8 px-6 pt-10 pb-12 md:pt-16 md:pb-16 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:pt-24 lg:pb-24">
				<div className="text-center lg:text-left">
					<div className="title-sub flex items-center justify-center gap-2 lg:justify-start">
						200 000+ ofert w jednym miejscu
					</div>
					<h1 className="mt-3 text-[34px] leading-[1.15] font-bold md:text-[50px]">
						Znajdź <WordRotator words={["mieszkanie", "dom", "działkę", "okazje"]} />
						<br />
						zanim zrobią to inni
					</h1>
					<p className="mx-auto mt-5 max-w-[520px] text-md lg:mx-0">
						Otodom, OLX, Morizon, Gratka i wiele innych portali naraz. Bez duplikatów, z historią cen i
						błyskawicznym alertem o okazji.
					</p>
					<div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
						<a href={routes.signupPage} className="btn btn-primary">
							Przeglądaj oferty
						</a>
						<a
							href="#porownanie"
							className="btn btn-light"
							style={{ border: "1px solid var(--color-ink)" }}
						>
							Zobacz różnicę
						</a>
					</div>
				</div>
				{/* The isometric one beside the text on large screens, a simpler one under the buttons below that; a hidden image is not loaded. */}
				<Image src={illustration} alt="" className="hidden w-full lg:block" />
				<Image
					src={illustrationMobile}
					alt=""
					className="mx-auto w-full max-w-[250px] md:max-w-[310px] lg:hidden"
				/>
			</div>
		</section>
	);
}
