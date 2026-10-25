import { Icon } from "@/components/icon";

const benefits = ["Jeden pulpit bez duplikatów", "Pełna oś czasu zmian cen", "Okazje poniżej średniej RCN"];

export function MapSection() {
	return (
		<section id="mapa" className="py-20">
			<div className="mx-auto grid max-w-[1170px] items-center gap-10 px-6 lg:grid-cols-[1fr_1.6fr]">
				<div>
					<h2 className="title">Szukaj tam, gdzie chcesz mieszkać</h2>
					<p className="mt-4">
						Zamiast sztywnych granic dzielnic rysujesz własny obszar, wybierasz promień albo filtrujesz po
						czasie dojazdu.
					</p>
					<ul className="mt-6 space-y-3 text-ink">
						{benefits.map((benefit) => (
							<li key={benefit} className="flex gap-3">
								<Icon name="check" className="text-ink" />
								{benefit}
							</li>
						))}
					</ul>
					<a href="#cennik" className="btn btn-slate mt-8">
						Zapisz obszar i włącz alerty
					</a>
				</div>
				<div className="relative min-h-[380px] overflow-hidden rounded-xl border border-line">
					<svg
						className="absolute inset-0 h-full w-full"
						viewBox="0 0 800 480"
						preserveAspectRatio="xMidYMid slice"
						aria-hidden="true"
					>
						<rect width="800" height="480" fill="#eceef3" />
						<path
							d="M-20,380 C150,330 250,420 400,370 S650,300 820,350 L820,500 L-20,500Z"
							fill="#b8daf7"
						/>
						<rect x="520" y="40" width="190" height="120" fill="#dbe8d6" />
						<g stroke="#fff" strokeWidth="14" fill="none">
							<path d="M0,120 L800,170" />
							<path d="M0,260 L800,230" />
							<path d="M180,0 L230,480" />
							<path d="M470,0 L430,480" />
							<path d="M680,0 L640,480" />
						</g>
						<path
							d="M230,95 L450,120 L470,290 L300,330 L210,230Z"
							fill="#576696"
							fillOpacity=".18"
							stroke="#576696"
							strokeWidth="2"
							strokeDasharray="8 6"
						/>
					</svg>
					<span className="head absolute top-[30%] left-[32%] rounded-sm bg-brand px-3 py-1 text-[12px] text-white">
						649k · −19%
					</span>
					<span className="head absolute top-[52%] left-[46%] rounded-sm bg-ink px-3 py-1 text-[12px] text-white">
						410k
					</span>
					<span className="head absolute top-[24%] left-[52%] rounded-sm bg-white px-3 py-1 text-[12px] text-ink">
						720k
					</span>
					<span className="head absolute top-[66%] left-[36%] rounded-sm bg-white px-3 py-1 text-[12px] text-ink">
						559k
					</span>
					<div className="absolute bottom-4 left-4 rounded-md bg-white px-4 py-3 text-ink">
						<b className="head font-medium">Mokotów</b> · 142 oferty w budżecie
					</div>
				</div>
			</div>
		</section>
	);
}
