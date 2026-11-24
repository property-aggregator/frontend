import Link from "next/link";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function PremiumButton({ onClick, className }: { onClick?: () => void; className?: string }) {
	return (
		<Link href={routes.premium} onClick={onClick} className={cn("btn btn-sm btn-primary px-5", className)}>
			Premium
		</Link>
	);
}
