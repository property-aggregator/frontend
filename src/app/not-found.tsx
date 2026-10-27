import type { Metadata } from "next";
import Link from "next/link";
import heroPhoto from "@/assets/landing/hero.webp";
import { BackgroundPhoto } from "@/components/background-photo";
import { BrandName, LogoMark } from "@/components/logo";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Nie znaleziono strony" };

export default function NotFound() {
	return (
		<main className="relative flex min-h-screen flex-col overflow-hidden bg-ink text-white">
			<BackgroundPhoto src={heroPhoto} darkness={0.9} priority />
			<div className="relative mx-auto flex h-[76px] w-full max-w-[1170px] items-center px-6">
				<Link
					href={routes.home}
					className="head flex items-center gap-2.5 text-[17px] font-semibold text-white"
				>
					<LogoMark variant="dark" />
					<BrandName />
				</Link>
			</div>
			<div className="relative mx-auto flex w-full max-w-[1170px] flex-1 flex-col justify-center px-6 pb-24">
				<p className="head text-[96px] leading-none font-bold text-white/15 md:text-[160px]">404</p>
				<h1 className="mt-4 text-[34px] leading-[1.15] font-bold text-white md:text-[50px]">
					Tej strony nie ma pod tym adresem
				</h1>
				<p className="mt-5 max-w-[520px] text-[15px] text-white/85">
					Mogła zostać przeniesiona albo usunięta, a może w adresie wkradła się literówka. Wróć na stronę
					główną albo poszukaj ofert.
				</p>
				<div className="mt-8 flex flex-wrap gap-3">
					<Link href={routes.home} className="btn btn-slate hover:bg-white hover:text-ink">
						Strona główna
					</Link>
					<Link href={routes.search} className="btn btn-ghost">
						Szukaj ofert
					</Link>
				</div>
			</div>
		</main>
	);
}
