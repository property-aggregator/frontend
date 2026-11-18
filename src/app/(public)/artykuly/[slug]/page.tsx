import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { type Article, ImageCredit, articlePath, articles, findArticle } from "@/features/articles/articles";
import { env } from "@/lib/env";
import { site } from "@/lib/site";

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

	const image = {
		url: article.image.src,
		width: article.image.width,
		height: article.image.height,
		alt: article.imageAlt,
	};

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
			siteName: site.domain,
			locale: "pl_PL",
			images: [image],
		},
		twitter: {
			card: "summary_large_image",
			title: article.title,
			description: article.description,
			images: [image],
		},
	};
}

function articleJsonLd(article: Article) {
	const url = (path: string) => new URL(path, env.APP_BASE_URL).toString();
	const organization = { "@type": "Organization", name: site.domain, url: url("/"), logo: url("/logo.svg") };

	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: article.title,
		description: article.description,
		image: [url(article.image.src)],
		datePublished: article.publishedAt,
		dateModified: article.publishedAt,
		inLanguage: "pl-PL",
		author: organization,
		publisher: organization,
		mainEntityOfPage: url(articlePath(article.slug)),
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
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)).replace(/</g, "\\u003c") }}
			/>
			<article>
				<time className="text-sm text-muted" dateTime={article.publishedAt}>
					{dateFormat.format(new Date(article.publishedAt))}
				</time>
				<h1 className="title mt-3">{article.title}</h1>
				<figure className="mt-8">
					<Image
						src={article.image}
						alt={article.imageAlt}
						sizes="(min-width: 760px) 712px, 100vw"
						placeholder="blur"
						preload
						className="w-full rounded-xl"
					/>
					<ImageCredit source={article.imageSource} />
				</figure>
				<div className="mt-8 space-y-4 text-md">{article.content}</div>
			</article>
		</main>
	);
}
