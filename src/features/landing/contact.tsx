import { ChevronDown, Mail } from "lucide-react";
import { Icon } from "@/components/icon";
import { site } from "@/lib/site";

const faq = [
	{
		question: "Czy muszę podawać kartę?",
		answer: "Nie. Plan darmowy nie wymaga karty, a pakiety Plus i Pro to płatności jednorazowe – bez subskrypcji i automatycznego odnawiania.",
	},
	{
		question: "Jak szybko otrzymam alert o nowej ofercie?",
		answer: "Skanujemy portale co kilka minut, więc powiadomienie SMS lub e-mail dostajesz niemal od razu po publikacji ogłoszenia.",
	},
	{
		question: "Czym są ceny RCN?",
		answer: "To rejestr cen z aktów notarialnych, czyli realne ceny sprzedaży, z którymi porównujemy oferty, aby wskazać Ci prawdziwe okazje.",
	},
	{
		question: "Czy działa na telefonie?",
		answer: "Tak, w przeglądarce telefonu, bez instalowania aplikacji.",
	},
];

export function Contact() {
	return (
		<section id="kontakt" className="bg-mist py-20">
			<div className="mx-auto max-w-[760px] px-6">
				<h2 className="title text-center">Masz pytania?</h2>
				<div className="mt-10 space-y-3">
					{faq.map(({ question, answer }) => (
						<details key={question} className="group rounded-lg bg-white px-5 py-4">
							<summary className="head flex items-center justify-between text-md text-ink">
								{question}
								<Icon icon={ChevronDown} className="transition-transform group-open:rotate-180" />
							</summary>
							<p className="mt-2">{answer}</p>
						</details>
					))}
				</div>
				<div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg bg-pastel-violet px-6 py-5 text-center sm:flex-row sm:text-left">
					<p className="head text-md font-medium text-ink">Masz inne pytanie lub sugestię? Napisz do nas:</p>
					<a href={`mailto:${site.email}`} className="btn btn-primary shrink-0">
						<Icon icon={Mail} className="text-lg" />
						{site.email}
					</a>
				</div>
			</div>
		</section>
	);
}
