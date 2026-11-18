import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { routes } from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
	const base = env.APP_BASE_URL.replace(/\/$/, "");

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: [
				routes.account,
				routes.favorites,
				routes.search,
				routes.properties,
				routes.consents,
				"/auth/",
				"/api/",
			],
		},
		sitemap: `${base}/sitemap.xml`,
	};
}
