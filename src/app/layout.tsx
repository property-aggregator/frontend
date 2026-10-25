import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// latin-ext is needed for Polish characters (ą, ę, ł, ś, ż…).
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
	title: {
		default: "Property Aggregator",
		template: "%s · Property Aggregator",
	},
	description: "Oferty nieruchomości z wielu portali w jednym miejscu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="pl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
			<body className="flex min-h-full flex-col bg-white text-zinc-900">{children}</body>
		</html>
	);
}
