import { Icon } from "@/components/icon";
import { ContactForm } from "./contact-form";

const faq = [
	{
		question: "Czy muszę podawać kartę?",
		answer: "Nie. Okres próbny jest bezpłatny, potem konto przechodzi na darmowy plan.",
	},
	{
		question: "Jak działa deduplikacja?",
		answer: "Porównujemy metraż, piętro, lokalizację i zdjęcia, a duplikaty łączymy w jedną kartę.",
	},
	{
		question: "Czym są ceny RCN?",
		answer: "To rejestr cen z aktów notarialnych, czyli realne ceny sprzedaży.",
	},
	{
		question: "Czy działa na telefonie?",
		answer: "Tak, w przeglądarce telefonu, bez instalowania aplikacji.",
	},
];

export function Contact() {
	return (
		<section id="kontakt" className="bg-mist py-20">
			<div className="mx-auto grid max-w-[1170px] gap-12 px-6 lg:grid-cols-2">
				<div>
					<h2 className="title">Zacznij szukać z nami</h2>
					<ContactForm />
				</div>
				<div>
					<h2 className="title">Masz pytania?</h2>
					<div className="mt-8 space-y-3">
						{faq.map(({ question, answer }) => (
							<details key={question} className="group rounded-xl bg-white px-5 py-4">
								<summary className="head flex items-center justify-between text-[15px] text-ink">
									{question}
									<Icon name="expand_more" className="transition-transform group-open:rotate-180" />
								</summary>
								<p className="mt-2">{answer}</p>
							</details>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
