# SEO aplikacji – analiza i wymagania

Dokument opisuje stan SEO frontendu na podstawie kodu z `main` (commit `aed9325`), listę wymagań oraz to, co zostało zrobione w tym zadaniu. Treści z landing page są przykładowe, więc nie są tu brane pod uwagę.

## 1. Stan obecny

- `lang="pl"` na `<html>` i font Figtree przez `next/font` z polskimi znakami.
- Globalne `title` (z szablonem `%s · domena`) i `description` w `src/app/layout.tsx`.
- Tylko regulamin i polityka prywatności mają własny `title`. Strona główna używa wartości globalnych.
- Strony prywatne (`/oferty`, `/oferty/[id]`, `/szukaj`, `/ulubione`, `/konto`, `/zgody`) mają `robots: { index: false }` i wymagają logowania.
- Brak `sitemap.xml`, `robots.txt`, `metadataBase`, Open Graph, danych strukturalnych (JSON-LD).
- `/najnowsze` i `/artykuly` są wpisane w `src/lib/routes.ts` jako publiczne, ale przed tym zadaniem nie istniała żadna strona pod tymi adresami.
- Domena w `src/lib/site.ts` to `homvia.pl`. W wcześniejszych ustaleniach mowa była o `ofertyzer.pl`. Trzeba to potwierdzić, zanim adresy w sitemap i kanoniczne zostaną uznane za ostateczne.

## 2. Główny problem

Google indeksuje tylko strony publiczne. Obecnie są to: strona główna, regulamin i polityka prywatności. Większość wartości serwisu (oferty, wyszukiwarka, mapa, historia cen) jest za logowaniem i z `noindex`. Bez decyzji dotyczącej stron publicznych SEO ograniczy się do kilku podstron o niewielkiej treści.

## 3. Wymagania

Priorytety: **M** – musi być, **S** – powinno być, **C** – może być.

| ID | Pri | Wymaganie | Stan |
| --- | --- | --- | --- |
| SEO-01 | M | Unikalny `title` i `description` na każdej stronie publicznej | Zrobione dla artykułów. Do zrobienia: strona główna (osobny opis) |
| SEO-02 | M | `metadataBase` i adresy kanoniczne w pełnym formacie | Zrobione (`APP_BASE_URL` w layoutcie, `alternates.canonical` w artykułach) |
| SEO-03 | M | `sitemap.xml` i `robots.txt` | Zrobione (`src/app/sitemap.ts`, `src/app/robots.ts`). Adresy zależą od decyzji o domenie |
| SEO-04 | M | Strony prywatne z `noindex`, publiczne bez | Działa. Trzeba utrzymać przy dodawaniu nowych stron |
| SEO-05 | M | Brak linków do nieistniejących stron i wpisów w sitemap | Do zrobienia: `/najnowsze` (wpisane w `routes.ts`, bez strony). Trzeba dodać stronę albo usunąć wpis |
| SEO-06 | S | Open Graph i Twitter Card, w tym `og:image` | Do zrobienia. Artykuły mają `openGraph` bez obrazu |
| SEO-07 | S | Dane strukturalne JSON-LD: `WebSite`/`Organization` na stronie głównej, `Article` w artykułach, `BreadcrumbList` | Do zrobienia |
| SEO-08 | S | Treść artykułów: jeden `h1`, sekcje `h2`, linkowanie wewnętrzne | Zrobione dla artykułów. Link w stopce dodany. Do rozważenia link w nawigacji nagłówka |
| SEO-09 | S | Obrazy z `alt`, odpowiednie rozmiary, lazy loading | Do sprawdzenia w `property-card.tsx`, `background-photo.tsx` i `oferty/[id]/page.tsx` |
| SEO-10 | S | Wydajność (Core Web Vitals) | Do zmierzenia Lighthouse na wdrożeniu produkcyjnym. Nie mierzyłem |
| SEO-11 | C | Data aktualizacji artykułu (`dateModified`) i strona RSS | Do zrobienia po pierwszych artykułach |
| SEO-12 | M (decyzja) | Czy publiczne strony ofert, miast lub dzielnic mają być indeksowane | **Do decyzji zespołu.** Wymaga publicznych endpointów w backendzie (bez logowania) i ustaleń, czy wolno pokazywać dane z ofert portali |

## 4. Decyzje do podjęcia

1. **Domena:** `homvia.pl` z kodu czy `ofertyzer.pl` z wcześniejszych ustaleń.
2. **SEO-12:** czy budujemy publiczne strony ofert (miasto, dzielnica, typ nieruchomości). Bez tego SEO pozostanie na poziomie kilku podstron informacyjnych.
3. **`/najnowsze`:** strona czy usunięcie wpisu z `routes.ts`.
4. **Frazy:** które wyszukiwania mają przyciągać ruch (np. „okazje mieszkaniowe [miasto]”). Trzeba to zebrać przed napisaniem kolejnych artykułów.

## 5. Co zostało zrobione w tym zadaniu

- Podstrona `/artykuly` (lista) i `/artykuly/[slug]` (artykuł) z osobnym `title`, `description`, kanonicznym adresem, Open Graph i statycznym generowaniem.
- Treści dwóch artykułów oparte na logice backendu: mediana ceny za m² (miasto, typ, transakcja, rynek, przedział powierzchni, opcjonalnie dzielnica) i próg okazji 15%.
- `metadataBase` w layoucie na podstawie `APP_BASE_URL`.
- `sitemap.ts` i `robots.ts`.
- Link „Artykuły” w stopce.

Treści artykułów wymagają przeglądu przed publikacją.

## 6. Jak sprawdzić

1. `npm run typecheck`, `npm run lint`, `npx prettier --check "src/**/*.{ts,tsx}"`.
2. `npm run build`. Nie zweryfikowano go w środowisku, w którym przygotowano zmiany, bo brakowało dostępu do fonts.googleapis.com (Figtree). Na zwykłym komputerze z dostępem do sieci powinien przejść.
3. Po uruchomieniu `npm run dev`: `/artykuly`, `/artykuly/jak-czytac-cene-za-metr-kwadratowy`, `/artykuly/historia-cen-oferty`, `/artykuly/nieistniejacy` (404), `/sitemap.xml`, `/robots.txt`.
4. Po wdrożeniu: Google Search Console, weryfikacja domeny, zgłoszenie sitemap.
