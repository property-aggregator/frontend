"use client";

import { createContext, useContext, useState } from "react";
import type { NotificationSettings } from "./api";

type Contacts = {
	/** Null when they could not be loaded: then nothing is held back for a missing contact. */
	settings: NotificationSettings | null;
	setSettings: (settings: NotificationSettings) => void;
};

const ContactsContext = createContext<Contacts>({ settings: null, setSettings: () => {} });

/** Shares the saved contacts, so the alerts know at once when an e-mail or phone is added or removed. */
export function ContactsProvider({
	initial,
	children,
}: {
	initial: NotificationSettings | null;
	children: React.ReactNode;
}) {
	const [settings, setSettings] = useState(initial);
	return <ContactsContext value={{ settings, setSettings }}>{children}</ContactsContext>;
}

/** Whether each channel has somewhere to go; true when the contacts are unknown. */
export function useContacts() {
	const { settings, setSettings } = useContext(ContactsContext);
	return {
		hasEmail: settings === null || Boolean(settings.email),
		hasPhone: settings === null || Boolean(settings.phone),
		setSettings,
	};
}
