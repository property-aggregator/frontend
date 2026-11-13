import { routes } from "@/lib/routes";

export type Article = {
	slug: string;
	title: string;
	description: string;
	// YYYY-MM-DD
	publishedAt: string;
	content: React.ReactNode;
};

// Newest first.
export const articles: Article[] = [
	{
		slug: "jak-czytac-cene-za-metr-kwadratowy",
		title: "Jak czytać cenę za metr kwadratowy",
		description:
			"Cena za m² pozwala porównać mieszkania o różnej powierzchni. Pokazujemy, jak ją liczymy i kiedy oferta jest naprawdę tania.",
		publishedAt: "2026-11-13",
		content: (
			<>
				<p>
					Dwa mieszkania za 500 000 zł nie są tak samo dobre, jeśli jedno ma 33 m², a drugie 60 m². Dlatego
					przy porównywaniu ofert patrzymy na cenę za metr kwadratowy: dzielimy cenę przez powierzchnię.
				</p>
				<p>Przykład: mieszkanie za 425 000 zł o powierzchni 50 m² kosztuje 8 500 zł za m².</p>
				<h2 className="head mt-8 text-[18px] font-bold">Sama cena za m² też nie wystarczy</h2>
				<p>
					Ta liczba ma sens dopiero obok innych. Mieszkanie z rynku wtórnego w centrum i nowe w podmiejskiej
					inwestycji mają inne ceny, nawet przy tej samej powierzchni. Dlatego porównujemy ofertę z medianą
					ceny za m² dla ofert o zbliżonych parametrach: w tym samym mieście, dla tego samego typu
					nieruchomości i rodzaju transakcji, na tym samym rynku (pierwotnym lub wtórnym) i w podobnym
					przedziale powierzchni. Jeśli znamy dzielnicę, bierzemy ją pod uwagę.
				</p>
				<h2 className="head mt-8 text-[18px] font-bold">Kiedy oferta jest okazją</h2>
				<p>
					Oferta trafia do okazji, gdy jej cena za m² jest co najmniej o 15% niższa od tej mediany. Próg 15%
					pozwala odsiać drobne wahania i wyłapać oferty, które wyraźnie odstają od rynku.
				</p>
				<p>
					Okazja nie oznacza jednak, że mieszkanie nie ma wad. Zanim zdecydujesz się na zakup, sprawdź stan
					prawny, wysokość czynszu i to, czego nie widać na zdjęciach.
				</p>
				<h2 className="head mt-8 text-[18px] font-bold">Gdy nie ma czego porównywać</h2>
				<p>
					Jeśli w danym mieście albo przedziale powierzchni jest za mało ofert, nie podajemy mediany i nie
					oznaczamy oferty jako okazji. Lepiej nie zgadywać, niż pokazać wynik oparty na przypadkowych danych.
				</p>
			</>
		),
	},
	{
		slug: "historia-cen-oferty",
		title: "Po co sprawdzać historię cen oferty",
		description:
			"Każda zmiana ceny jest zapisywana. Pokazujemy, jak czytać historię cen i czego z niej nie wnioskować.",
		publishedAt: "2026-11-13",
		content: (
			<>
				<p>
					Sprzedający często obniża cenę kilka tygodni po publikacji ogłoszenia. Bywa, że chce szybko
					sprzedać, a bywa, że to dopiero początek negocjacji. Dlatego zapisujemy każdą zmianę ceny oferty.
				</p>
				<h2 className="head mt-8 text-[18px] font-bold">Co widać w historii</h2>
				<p>
					Dla każdej oferty pokazujemy datę pierwszego zauważenia, datę ostatniej zmiany ceny i kolejne ceny.
					Jeśli oferta była obniżana kilka razy, widać to od razu, a nie tylko w bieżącym ogłoszeniu.
				</p>
				<h2 className="head mt-8 text-[18px] font-bold">Czego z niej nie wnioskować</h2>
				<p>
					Obniżka nie dowodzi, że mieszkanie ma wadę. Wysoka cena na starcie nie oznacza z kolei, że
					sprzedający jest nieuczciwy. Historia pomaga zadać lepsze pytania, ale nie zastępuje oględzin i
					sprawdzenia dokumentów.
				</p>
				<h2 className="head mt-8 text-[18px] font-bold">Gdy oferta znika z portalu</h2>
				<p>
					Nie usuwamy historii oferty, która zniknęła z portalu. Oznaczamy ją jako archiwalną, dzięki czemu
					wiadomo, jak długo była dostępna i jakie miała ceny.
				</p>
			</>
		),
	},
];

export function findArticle(slug: string): Article | undefined {
	return articles.find((article) => article.slug === slug);
}

export function articlePath(slug: string): string {
	return `${routes.articles}/${slug}`;
}
