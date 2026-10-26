import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { LegalDocument, LegalVersion } from "./documents";

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeZone: "UTC" });

function Day({ date }: { date: Date }) {
	return <time dateTime={date.toISOString().slice(0, 10)}>{dateFormat.format(date)}</time>;
}

function dayBefore(iso: string): Date {
	const date = new Date(iso);
	date.setUTCDate(date.getUTCDate() - 1);
	return date;
}

function Validity({ document, index }: { document: LegalDocument; index: number }) {
	const from = new Date(document.versions[index].effectiveFrom);
	if (index === 0) {
		return (
			<>
				Obowiązuje od <Day date={from} />
			</>
		);
	}

	return (
		<>
			Wersja obowiązująca od <Day date={from} /> do{" "}
			<Day date={dayBefore(document.versions[index - 1].effectiveFrom)} />
		</>
	);
}

export function LegalDocumentPage({ document, version }: { document: LegalDocument; version: LegalVersion }) {
	const index = document.versions.indexOf(version);
	const previous = document.versions.slice(1);

	return (
		<main className="mx-auto max-w-[760px] px-6 py-20">
			<h1 className="title">{document.title}</h1>
			<p className="mt-3 text-[13px] text-muted">
				<Validity document={document} index={index} />
			</p>

			{index > 0 && (
				<p className="mt-6 rounded-lg bg-mist p-4 text-[14px]">
					To archiwalna wersja dokumentu.{" "}
					<Link href={document.path} className="font-semibold text-ink underline">
						Zobacz aktualną wersję
					</Link>
				</p>
			)}

			<div className="mt-6 space-y-4 text-[15px]">{version.content}</div>

			{index === 0 && previous.length > 0 && (
				<section className="mt-12 border-t border-line pt-6">
					<h2 className="head text-[16px] font-bold">Poprzednie wersje</h2>
					<ul className="mt-3 space-y-1.5">
						{previous.map((item, i) => (
							<li key={item.effectiveFrom}>
								<Link href={`${document.path}/${item.effectiveFrom}`} className="text-ink underline">
									<Validity document={document} index={i + 1} />
								</Link>
							</li>
						))}
					</ul>
				</section>
			)}
		</main>
	);
}

export async function LegalArchivePage({
	document,
	params,
}: {
	document: LegalDocument;
	params: Promise<{ version: string }>;
}) {
	const { version } = await params;
	const found = document.versions.find((item) => item.effectiveFrom === version);
	if (!found) {
		notFound();
	}
	if (found === document.versions[0]) {
		redirect(document.path);
	}

	return <LegalDocumentPage document={document} version={found} />;
}
