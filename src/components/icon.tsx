import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Icon({ icon: Glyph, className }: { icon: LucideIcon; className?: string }) {
	return <Glyph size="1em" strokeWidth={1.5} aria-hidden="true" className={cn("icon", className)} />;
}
