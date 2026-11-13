import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articlePath, articles, findArticle } from "@/features/articles/articles";

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeZone: "UTC" });

export function generateStaticParams() {
	return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps<"/artykuly/[slug]">): Promise<Metadata> {
	const { slug } = await params;
	const article = findArticle(slug);
	if (!article) {
		return {};
	}

	return {
		title: article.title,
		description: article.description,
		alternates: { canonical: articlePath(slug) },
		openGraph: {
			title: article.title,
			description: article.description,
			type: "article",
			publishedTime: article.publishedAt,
			url: articlePath(slug),
		},
	};
}

export default async function ArticlePage({ params }: PageProps<"/artykuly/[slug]">) {
	const { slug } = await params;
	const article = findArticle(slug);
	if (!article) {
		notFound();
	}

	return (
		<main className="mx-auto max-w-[760px] px-6 py-20">
			<article>
				<time className="text-[13px] text-muted" dateTime={article.publishedAt}>
					{dateFormat.format(new Date(article.publishedAt))}
				</time>
				<h1 className="title mt-3">{article.title}</h1>
				<div className="mt-8 space-y-4 text-[15px]">{article.content}</div>
			</article>
		</main>
	);
}
