import { unstable_rethrow } from "next/navigation";
import { getUnreadNotificationsCount } from "@/features/notifications/api";

/** Polled by the header badge; on any failure the badge keeps its last count. */
export async function GET() {
	try {
		return Response.json({ count: await getUnreadNotificationsCount() });
	} catch (error) {
		unstable_rethrow(error);
		return Response.json({ count: null });
	}
}
