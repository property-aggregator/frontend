import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { routes } from "@/lib/routes";

export async function GET() {
	redirect((await auth0.getSession()) ? routes.properties : routes.login);
}
