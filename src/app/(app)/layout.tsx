import { AppHeader } from "@/components/app-header";
import { NavigationTracker } from "@/components/navigation-history";
import { SiteFooter } from "@/components/site-footer";
import { getFavoriteIds } from "@/features/favorites/api";
import { FavoritesCountProvider } from "@/features/favorites/favorites-count";
import { getUnreadNotificationsCount } from "@/features/notifications/api";
import { UnreadNotificationsProvider } from "@/features/notifications/unread-count";

async function loadFavoritesCount(): Promise<number | null> {
	try {
		return (await getFavoriteIds()).size;
	} catch {
		// The page itself handles a missing session or unaccepted terms; the badge just stays hidden.
		return null;
	}
}

async function loadUnreadCount(): Promise<number | null> {
	try {
		return await getUnreadNotificationsCount();
	} catch {
		return null;
	}
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<FavoritesCountProvider countPromise={loadFavoritesCount()}>
			<UnreadNotificationsProvider countPromise={loadUnreadCount()}>
				<NavigationTracker />
				<div className="flex min-h-screen flex-col">
					<AppHeader />
					<div className="flex-1">{children}</div>
					<SiteFooter />
				</div>
			</UnreadNotificationsProvider>
		</FavoritesCountProvider>
	);
}
