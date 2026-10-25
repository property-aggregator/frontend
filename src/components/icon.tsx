import { cn } from "@/lib/utils";

/**
 * Material Symbols icon. A new icon name must also be added to iconNames in app/layout.tsx,
 * otherwise the font file won't contain it.
 */
export function Icon({ name, className }: { name: string; className?: string }) {
	return (
		<span className={cn("icon", className)} aria-hidden="true">
			{name}
		</span>
	);
}
