import type { Metadata } from "next";
import Link from "next/link";
import { articlePath, articles } from "@/features/articles/articles";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
	title: "Artykuły",
	description: "Poradniki o szukaniu mieszkania: jak czytać ceny, oceniać oferty i korzystać z historii cen.",
	alternates: { canonical: routes.articles },
};

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeZone: "UTC" });

export default function ArticlesPage() {
	return (
		<main className="mx-auto max-w-[760px] px-6 py-20">
			<h1 className="title">Artykuły</h1>

			<ul className="mt-10 space-y-10">
				{articles.map((article) => (
					<li key={article.slug}>
						<time className="text-[13px] text-muted" dateTime={article.publishedAt}>
							{dateFormat.format(new Date(article.publishedAt))}
						</time>
						<h2 className="head mt-2 text-[20px] font-bold">
							<Link
								href={articlePath(article.slug)}
								className="text-ink underline-offset-4 hover:underline"
							>
								{article.title}
							</Link>
						</h2>
						<p className="mt-2 text-[15px]">{article.description}</p>
					</li>
				))}
			</ul>
		</main>
	);
}
