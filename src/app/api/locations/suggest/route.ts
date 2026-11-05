import type { NextRequest } from "next/server";
import { suggestLocations } from "@/features/properties/api";
import { LOCATION_QUERY_MAX_LENGTH, LOCATION_QUERY_MIN_LENGTH } from "@/features/properties/search-params";

export async function GET(request: NextRequest) {
	const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
	if (query.length < LOCATION_QUERY_MIN_LENGTH || query.length > LOCATION_QUERY_MAX_LENGTH) {
		return Response.json([]);
	}

	return Response.json(await suggestLocations(query));
}
