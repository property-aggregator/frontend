import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// latin-ext is needed for Polish characters (ą, ę, ł, ś, ż…).
const figtree = Figtree({
	variable: "--font-figtree",
	subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
	title: {
		default: `${site.domain} – Wszystkie nieruchomości w jednym miejscu`,
		template: `%s · ${site.domain}`,
	},
	description:
		"Oferty nieruchomości z ponad 300 portali w jednym miejscu. Bez duplikatów, z historią cen i alertami.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	// Browser extensions add attributes to <body> before hydration; suppressHydrationWarning covers only that element.
	return (
		<html lang="pl" data-scroll-behavior="smooth" className={`${figtree.variable} scroll-smooth antialiased`}>
			<body className="bg-white" suppressHydrationWarning>
				{children}
			</body>
		</html>
	);
}
