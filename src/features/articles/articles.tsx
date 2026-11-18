import Image, { type StaticImageData } from "next/image";
import buildingPhoto from "@/assets/articles/building.webp";
import coinsPhoto from "@/assets/articles/coins.webp";
import { routes } from "@/lib/routes";

export type Article = {
	slug: string;
	title: string;
	description: string;
	// YYYY-MM-DD
	publishedAt: string;
	image: StaticImageData;
	imageAlt: string;
	imageSource: string;
	content: React.ReactNode;
};

function Heading({ children }: { children: React.ReactNode }) {
	return <h2 className="head mt-10 text-2xl font-bold">{children}</h2>;
}

export function ImageCredit({ source }: { source: string }) {
	return (
		<figcaption className="mt-2 text-sm text-muted">
			Obraz z{" "}
			<a href={source} className="transition-colors hover:text-slate" target="_blank" rel="noopener">
				magnific.com
			</a>
		</figcaption>
	);
}

function Figure({ src, alt, source }: { src: StaticImageData; alt: string; source: string }) {
	return (
		<figure className="my-8">
			<Image
				src={src}
				alt={alt}
				sizes="(min-width: 760px) 712px, 100vw"
				placeholder="blur"
				className="w-full rounded-xl"
			/>
			<ImageCredit source={source} />
		</figure>
	);
}

// Newest first.
export const articles: Article[] = [
	{
		slug: "historia-cen-oferty",
		title: "Nie przepłać za mieszkanie. Jak czytać historię cen ogłoszenia",
		description:
			"Każda zmiana ceny ogłoszenia jest zapisywana. Wyjaśniamy, jak czytać historię cen, co mówią obniżki i podwyżki oraz jak użyć tej wiedzy w negocjacjach.",
		publishedAt: "2026-11-18",
		image: buildingPhoto,
		imageAlt: "Nowoczesny budynek mieszkalny z balkonami",
		imageSource: "https://www.magnific.com/free-photo/modern-residential-building_9192853.htm",
		content: (
			<>
				<p>
					Ogłoszenie pokazuje tylko bieżącą cenę. Nie widać w nim, że mieszkanie wystawiono trzy miesiące temu
					o 40 000 zł drożej, że cena spadała już dwa razy ani że to samo mieszkanie wisi na innym portalu w
					innej kwocie. Tymczasem właśnie te informacje najwięcej mówią o sprzedającym i o tym, ile można
					wynegocjować.
				</p>
				<p>
					Dlatego dla każdej oferty zapisujemy każdą zmianę ceny. W tym artykule pokazujemy, jak czytać
					historię cen, jakie wnioski są uprawnione, a jakich lepiej nie wyciągać.
				</p>

				<Heading>Dlaczego sama cena z ogłoszenia to za mało</Heading>
				<p>
					Cena ofertowa to cena, za którą sprzedający chciałby sprzedać, a nie cena, za którą mieszkanie
					zostanie sprzedane. Różnica bywa duża, zwłaszcza na rynku wtórnym. Sprzedający często zaczyna
					wysoko, obserwuje zainteresowanie i dopiero po kilku tygodniach ciszy obniża cenę.
				</p>
				<p>
					Portale zwykle nie pokazują tego procesu. Po zmianie ceny ogłoszenie wygląda tak, jakby od początku
					kosztowało tyle samo. Bywa też, że sprzedający usuwa ogłoszenie i wystawia je ponownie, żeby znów
					trafić na górę listy jako nowość. Bez historii cen trudno to zauważyć.
				</p>

				<Heading>Co widać w historii cen</Heading>
				<p>
					Na stronie oferty historia cen jest pokazana jako oś czasu, od najnowszej zmiany do pierwszej ceny.
					Przy każdym wpisie widać:
				</p>
				<ul className="list-disc space-y-2 pl-5">
					<li>datę, kiedy zauważyliśmy daną cenę,</li>
					<li>samą cenę,</li>
					<li>zmianę względem poprzedniej ceny, w złotówkach i w procentach.</li>
				</ul>

				<Heading>Jak czytać obniżki</Heading>
				<Figure
					src={coinsPhoto}
					alt="Malejące stosy monet przed kalkulatorem i lupą"
					source="https://www.magnific.com/free-photo/graphic-concept-with-coins-high-angle_13819868.htm"
				/>
				<p>
					Jedna obniżka o kilka procent zaraz po publikacji zwykle oznacza, że sprzedający testował rynek i
					szybko skorygował cenę. Kilka mniejszych obniżek rozłożonych na miesiące to inny sygnał: oferta nie
					znajduje kupca, a sprzedający stopniowo schodzi z ceny. W takiej sytuacji często jest gotów zejść
					jeszcze niżej.
				</p>
				<p>
					Warto też patrzeć na to, ile czasu minęło od ostatniej zmiany. Jeśli cena spadła wczoraj,
					sprzedający może poczekać na reakcję rynku, zanim zgodzi się na kolejne ustępstwa. Jeśli od
					ostatniej obniżki minęło kilka tygodni, a ogłoszenie wciąż wisi, masz lepszą pozycję do rozmowy.
				</p>
				<p>
					Procenty są ważniejsze niż złotówki. Obniżka o 20 000 zł to dużo przy mieszkaniu za 350 000 zł, ale
					niewiele przy apartamencie za 1,5 mln zł.
				</p>

				<Heading>Podwyżki też się zdarzają</Heading>
				<p>
					Cena nie zawsze spada. Podwyżka w trakcie sprzedaży może oznaczać, że sprzedający dostał kilka
					zapytań i uznał, że wycenił mieszkanie za nisko. Na rynku pierwotnym deweloperzy podnoszą ceny, gdy
					inwestycja dobrze się sprzedaje albo rosną koszty budowy. W obu przypadkach warto szybko podjąć
					decyzję, bo oferta raczej nie stanieje.
				</p>

				<Heading>To samo mieszkanie na kilku portalach</Heading>
				<p>
					Jedno mieszkanie często jest wystawione równocześnie przez właściciela i jedno lub dwa biura
					nieruchomości, a każde ogłoszenie może mieć inną cenę. Na stronie oferty pokazujemy potencjalne
					duplikaty, czyli ogłoszenia, które najpewniej dotyczą tej samej nieruchomości. Jeśli w jednym z nich
					cena jest niższa, łatwo to zauważyć i zapytać o powód.
				</p>

				<Heading>Archiwum i ceny transakcyjne</Heading>
				<p>
					Nie usuwamy historii oferty, która zniknęła z portalu. Oznaczamy ją jako archiwalną, dzięki czemu
					wiadomo, jak długo była dostępna i jakie miała ceny. Przy każdej ofercie pokazujemy też podobne
					oferty z archiwum, o zbliżonej powierzchni i cenie, z okolicy lub z tego samego miasta. Jeśli
					podobne mieszkania długo wisiały i były wielokrotnie przeceniane, ta oferta może pójść tą samą
					drogą.
				</p>
				<p>
					Ceny ofertowe to jednak tylko połowa obrazu. Dlatego obok pokazujemy podobne transakcje z rejestru
					cen nieruchomości, czyli kwoty, za które mieszkania w okolicy faktycznie zmieniły właściciela.
				</p>

				<Heading>Czego z historii cen nie wnioskować</Heading>
				<p>
					Obniżka nie dowodzi, że mieszkanie ma wadę. Sprzedający może potrzebować pieniędzy na zakup innej
					nieruchomości, przeprowadzać się do innego miasta albo po prostu źle wycenić mieszkanie na starcie.
					Wysoka cena początkowa nie oznacza z kolei, że sprzedający jest nieuczciwy.
				</p>
				<p>
					Historia cen pomaga zadać lepsze pytania, ale nie zastępuje oględzin, sprawdzenia księgi wieczystej,
					wysokości czynszu i stanu technicznego budynku.
				</p>

				<Heading>Jak wykorzystać historię cen w negocjacjach</Heading>
				<ul className="list-disc space-y-2 pl-5">
					<li>
						Jeśli oferta była przeceniana kilka razy, zaproponuj cenę poniżej ostatniej obniżki. Sprzedający
						już pokazał, że jest gotów schodzić z ceny.
					</li>
					<li>
						Porównaj cenę z duplikatami i z ofertami z archiwum. Jeśli to samo mieszkanie jest gdzieś
						tańsze, masz konkretny argument.
					</li>
					<li>
						Sprawdź ceny transakcyjne w okolicy. Pokazują, ile kupujący faktycznie płacą, a nie ile chcą
						dostać sprzedający.
					</li>
					<li>
						Dodaj ofertę do ulubionych i obserwuj ją. Kolejna obniżka może pojawić się, zanim zdecydujesz.
					</li>
				</ul>

				<Heading>Podsumowanie</Heading>
				<p>
					Historia cen zamienia pojedynczą liczbę z ogłoszenia w opowieść o tym, jak sprzedaż przebiega.
					Pokazuje, czy sprzedający się spieszy, jak reaguje na brak zainteresowania i na ile wycenia
					mieszkanie realnie. Połączona z duplikatami, archiwum i cenami transakcyjnymi daje mocną podstawę do
					rozmowy o cenie.
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
