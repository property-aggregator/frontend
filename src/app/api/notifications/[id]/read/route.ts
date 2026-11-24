import { unstable_rethrow } from "next/navigation";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { markNotificationRead } from "@/features/notifications/api";
import { ApiError } from "@/lib/api/errors";

/** A route handler, not a server action: an action in flight would hold up the navigation to the offer. */
export async function PUT(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	if (!z.uuid().safeParse(id).success) {
		return new Response(null, { status: 400 });
	}

	try {
		await markNotificationRead(id);
	} catch (error) {
		unstable_rethrow(error);
		if (!(error instanceof ApiError) || error.status !== 404) {
			return new Response(null, { status: 502 });
		}
	}
	return new Response(null, { status: 204 });
}
