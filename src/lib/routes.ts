export const routes = {
  home: "/",
  latest: "/najnowsze",
  articles: "/artykuly",
  terms: "/regulamin",
  privacy: "/polityka-prywatnosci",
  consents: "/zgody",
  properties: "/oferty",
  favorites: "/ulubione",
  account: "/konto",
  login: "/auth/login",
  signup: "/auth/login?screen_hint=signup",
  logout: "/auth/logout",
} as const;

// Everything else requires a session. Keep this an allowlist, so a new page is private by default.
const publicPaths: string[] = [routes.home, routes.latest, routes.terms, routes.privacy];
const publicPrefixes: string[] = [routes.articles];

export function isPublicPath(pathname: string): boolean {
  return (
    publicPaths.includes(pathname) ||
    publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

export function loginUrl(returnTo?: string): string {
  return returnTo ? `${routes.login}?returnTo=${encodeURIComponent(returnTo)}` : routes.login;
}
