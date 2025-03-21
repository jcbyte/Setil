import type { Timestamp } from "firebase/firestore";

export type Currency = "gbp" | "usd" | "eur";

export interface UserData {
	groups: string[];
}

export interface GroupData {
	name: string;
	description: string | null;
	currency: Currency;
	owner: string;
	lastUpdate: Timestamp;
}

export interface GroupUserData {
	name: string;
	photoURL: string | null;
	status: "active" | "left" | "history";
	balance: Record<string, number>;
	lastUpdate: Timestamp;
}

export interface Transaction {
	title: string;
	from: string;
	to: Record<string, number>;
	date: Timestamp;
}

export interface Invite {
	expiry: Timestamp;
}
