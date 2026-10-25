import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// latin-ext is needed for Polish characters (ą, ę, ł, ś, ż…).
const figtree = Figtree({
	variable: "--font-figtree",
	subsets: ["latin", "latin-ext"],
});

// Material Symbols is not in next/font. icon_names limits the file to the icons in use: add new ones here.
const iconNames = [
	"add_home",
	"arrow_right_alt",
	"bed",
	"bolt",
	"check",
	"close",
	"construction",
	"content_copy",
	"dashboard",
	"expand_more",
	"help",
	"home",
	"location_on",
	"menu",
	"monitoring",
	"notifications_active",
	"person",
	"real_estate_agent",
	"schedule",
	"square_foot",
	"tab_unselected",
	"travel_explore",
	"trending_down",
	"verified",
];
const iconsUrl = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&icon_names=${iconNames.join(",")}&display=block`;

export const metadata: Metadata = {
	title: {
		default: `${site.domain} – Wszystkie nieruchomości w jednym miejscu`,
		template: `%s · ${site.domain}`,
	},
	description:
		"Oferty nieruchomości z ponad 300 portali w jednym miejscu. Bez duplikatów, z historią cen i alertami.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="pl" data-scroll-behavior="smooth" className={`${figtree.variable} scroll-smooth antialiased`}>
			<head>
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
				<link rel="stylesheet" href={iconsUrl} />
			</head>
			<body className="bg-white">{children}</body>
		</html>
	);
}
