import "server-only";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import type { components } from "./schema";

export type ProblemDetails = components["schemas"]["ProblemDetails"];
export type ErrorCode = ProblemDetails["code"];

export class ApiError extends Error {
	constructor(
		readonly status: number,
		readonly problem?: ProblemDetails,
	) {
		super(problem?.title ?? `API request failed with status ${status}`);
		this.name = "ApiError";
	}

	get code(): ErrorCode | undefined {
		return this.problem?.code;
	}
}

function isProblemDetails(value: unknown): value is ProblemDetails {
	return typeof value === "object" && value !== null && "code" in value && "traceId" in value;
}

type ApiResult<T> = { data?: T; error?: unknown; response: Response };

/**
 * Returns the response data, or handles the error:
 * 401 → sign in again, 403 terms_not_accepted → consents screen, anything else → ApiError.
 */
export function unwrap<T>({ data, error, response }: ApiResult<T>): T {
	if (response.ok) {
		return data as T;
	}

	const problem = isProblemDetails(error) ? error : undefined;

	if (response.status === 401) {
		redirect(routes.login);
	}

	if (response.status === 403 && problem?.code === "terms_not_accepted") {
		redirect(routes.consents);
	}

	throw new ApiError(response.status, problem);
}
