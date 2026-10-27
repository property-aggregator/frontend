import statsPhoto from "@/assets/landing/stats.webp";
import { BackgroundPhoto } from "@/components/background-photo";
import { CountUp } from "./count-up";

const stats = [
	{ prefix: "", value: 300, suffix: "+", label: "portali i biur" },
	{ prefix: "", value: 25, suffix: "k+", label: "ofert dziennie" },
	{ prefix: "<", value: 30, suffix: " s", label: "czas alertu" },
	{ prefix: "", value: 10, suffix: "k+", label: "użytkowników" },
];

export function Stats() {
	return (
		<section className="relative overflow-hidden bg-ink text-white">
			<BackgroundPhoto src={statsPhoto} darkness={0.9} parallax />
			<div className="relative mx-auto grid max-w-[1170px] grid-cols-2 gap-8 px-6 py-16 text-center md:grid-cols-4">
				{stats.map(({ prefix, value, suffix, label }) => (
					<div key={label}>
						<div className="head text-[44px] leading-none text-white">
							{prefix}
							<CountUp to={value} />
							{suffix}
						</div>
						<div className="mt-2 text-[12px] tracking-wider text-white/70 uppercase">{label}</div>
					</div>
				))}
			</div>
		</section>
	);
}
