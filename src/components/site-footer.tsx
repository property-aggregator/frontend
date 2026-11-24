import Link from "next/link";
import { BrandName, LogoMark } from "@/components/logo";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

export function SiteFooter() {
	return (
		<footer className="border-t border-ink/[0.12] bg-white">
			<div className="mx-auto grid max-w-[1170px] gap-10 px-6 py-14 md:grid-cols-3">
				<div>
					<div className="head flex items-center gap-2.5 text-[17px] font-semibold text-ink">
						<LogoMark />
						<BrandName />
					</div>
					<p className="mt-4">Wszystkie oferty w jednym miejscu. Błyskawiczne alerty o okazjach.</p>
				</div>
				<div>
					<h4 className="text-md font-medium">Serwis</h4>
					<div className="mt-4 grid gap-1.5">
						<Link className="hover:text-primary" href="/#oferty">
							Oferty
						</Link>
						<Link className="hover:text-primary" href="/#mapa">
							Mapa
						</Link>
						<Link className="hover:text-primary" href="/#cennik">
							Cennik
						</Link>
						<Link className="hover:text-primary" href={routes.articles}>
							Artykuły
						</Link>
					</div>
				</div>
				<div>
					<h4 className="text-md font-medium">Kontakt</h4>
					<div className="mt-4 grid gap-1.5">
						<a className="hover:text-primary" href={`mailto:${site.email}`}>
							{site.email}
						</a>
						<Link className="hover:text-primary" href={routes.terms}>
							Regulamin
						</Link>
						<Link className="hover:text-primary" href={routes.privacy}>
							Polityka prywatności
						</Link>
					</div>
				</div>
			</div>
			<div className="border-t border-line bg-mist py-5 text-center text-xs text-muted">
				© 2026 {site.domain} ·{" "}
				<a
					className="hover:text-primary"
					href="https://storyset.com/home"
					target="_blank"
					rel="noopener noreferrer"
				>
					Home illustrations by Storyset
				</a>
			</div>
		</footer>
	);
}
