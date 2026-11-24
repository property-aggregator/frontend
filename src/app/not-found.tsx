import type { Metadata } from "next";
import Link from "next/link";
import { BrandName, LogoMark } from "@/components/logo";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Nie znaleziono strony" };

export default function NotFound() {
	return (
		<main className="flex min-h-screen flex-col">
			<div className="mx-auto flex h-[76px] w-full max-w-[1170px] items-center px-6">
				<Link href={routes.home} className="head flex items-center gap-2.5 text-[17px] font-semibold text-ink">
					<LogoMark />
					<BrandName />
				</Link>
			</div>
			<div className="mx-auto flex w-full max-w-[1170px] flex-1 flex-col justify-center px-6 pb-24">
				<p className="head text-[96px] leading-none font-bold text-ink/10 md:text-[160px]">404</p>
				<h1 className="mt-4 text-[34px] leading-[1.15] font-bold md:text-[50px]">
					Tej strony nie ma pod tym adresem
				</h1>
				<p className="mt-5 max-w-[520px] text-md">
					Mogła zostać przeniesiona albo usunięta, a może w adresie wkradła się literówka. Wróć na stronę
					główną albo poszukaj ofert.
				</p>
				<div className="mt-8 flex flex-wrap gap-3">
					<Link href={routes.home} className="btn btn-primary">
						Strona główna
					</Link>
					<Link href={routes.search} className="btn btn-soft">
						Szukaj ofert
					</Link>
				</div>
			</div>
		</main>
	);
}
