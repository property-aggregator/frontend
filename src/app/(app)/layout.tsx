import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { getFavoriteIds } from "@/features/favorites/api";
import { FavoritesCountProvider } from "@/features/favorites/favorites-count";

async function loadFavoritesCount(): Promise<number | null> {
	try {
		return (await getFavoriteIds()).size;
	} catch {
		// The page itself handles a missing session or unaccepted terms; the badge just stays hidden.
		return null;
	}
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<FavoritesCountProvider countPromise={loadFavoritesCount()}>
			<div className="flex min-h-screen flex-col bg-mist">
				<AppHeader />
				<div className="flex-1">{children}</div>
				<SiteFooter />
			</div>
		</FavoritesCountProvider>
	);
}
