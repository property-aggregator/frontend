import Link from "next/link";
import { routes } from "@/lib/routes";

export function PremiumButton({ onClick }: { onClick?: () => void }) {
	return (
		<Link href={routes.premium} onClick={onClick} className="btn btn-sm btn-slate px-4 md:px-5">
			Premium
		</Link>
	);
}
