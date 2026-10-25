import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function LogoMark({ variant = "light", className }: { variant?: "light" | "dark"; className?: string }) {
	const dark = variant === "dark";

	return (
		<svg
			className={cn("h-9 w-10", className)}
			viewBox="37 51 438 406"
			fill="none"
			strokeWidth="22"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<g transform="translate(0 -14)">
				<g className={dark ? "stroke-white" : "stroke-ink"}>
					<path d="M 56 252 L 256 84 L 456 252" />
					<path d="M 96 222 V 424 H 322" />
					<path d="M 416 218 V 396" />
				</g>
				<g className={dark ? "stroke-[#a9b6e8]" : "stroke-slate"}>
					<circle cx="248" cy="304" r="72" />
					<line x1="299" y1="355" x2="396" y2="452" />
				</g>
			</g>
		</svg>
	);
}

export function BrandName() {
	return <>{site.domain}</>;
}
