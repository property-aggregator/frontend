import "server-only";
import { z } from "zod";

const envSchema = z.object({
	API_BASE_URL: z.url(),
	AUTH0_DOMAIN: z.string().min(1),
	AUTH0_CLIENT_ID: z.string().min(1),
	AUTH0_CLIENT_SECRET: z.string().min(1),
	AUTH0_AUDIENCE: z.string().min(1),
	AUTH0_SECRET: z.string().regex(/^[0-9a-f]{64}$/, "Generate with: openssl rand -hex 32"),
	APP_BASE_URL: z.url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	throw new Error(`Invalid environment variables (see .env.example):\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
