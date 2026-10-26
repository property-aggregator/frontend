import Link from "next/link";
import { BrandName, LogoMark } from "@/components/logo";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

export function SiteFooter() {
	return (
		<footer className="bg-ink text-white/70">
			<div className="mx-auto grid max-w-[1170px] gap-10 px-6 py-14 md:grid-cols-3">
				<div>
					<div className="head flex items-center gap-2.5 text-[17px] font-semibold text-white">
						<LogoMark variant="dark" />
						<BrandName />
					</div>
					<p className="mt-4">
						Wszystkie oferty z ponad 300 portali w jednym miejscu. Alerty o okazjach w mniej niż 30 sekund.
					</p>
				</div>
				<div>
					<h4 className="text-[15px] font-medium text-white">Serwis</h4>
					<div className="mt-4 grid gap-1.5">
						<Link className="hover:text-white" href="/#oferty">
							Oferty
						</Link>
						<Link className="hover:text-white" href="/#mapa">
							Mapa
						</Link>
						<Link className="hover:text-white" href="/#cennik">
							Cennik
						</Link>
					</div>
				</div>
				<div>
					<h4 className="text-[15px] font-medium text-white">Kontakt</h4>
					<div className="mt-4 grid gap-1.5">
						<a className="hover:text-white" href={`mailto:${site.email}`}>
							{site.email}
						</a>
						<Link className="hover:text-white" href={routes.terms}>
							Regulamin
						</Link>
						<Link className="hover:text-white" href={routes.privacy}>
							Polityka prywatności
						</Link>
					</div>
				</div>
			</div>
			<div className="bg-black/20 py-5 text-center text-[12px]">© 2026 {site.domain} · Zdjęcia: Unsplash</div>
		</footer>
	);
}
