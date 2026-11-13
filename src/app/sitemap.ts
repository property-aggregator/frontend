import type { MetadataRoute } from "next";
import { articlePath, articles } from "@/features/articles/articles";
import { env } from "@/lib/env";
import { routes } from "@/lib/routes";

// Only public pages. Private pages (offers, search, account) are not listed and are noindex.
export default function sitemap(): MetadataRoute.Sitemap {
	const base = env.APP_BASE_URL.replace(/\/$/, "");

	return [
		{ url: `${base}${routes.home}` },
		{ url: `${base}${routes.articles}` },
		...articles.map((article) => ({
			url: `${base}${articlePath(article.slug)}`,
			lastModified: article.publishedAt,
		})),
		{ url: `${base}${routes.terms}` },
		{ url: `${base}${routes.privacy}` },
	];
}
