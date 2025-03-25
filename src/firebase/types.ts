import type { Timestamp } from "firebase/firestore";

export type Currency = "gbp" | "usd" | "eur";

export type TransactionCategory = "expense" | "payment";

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
	balance: number;
	lastUpdate: Timestamp;
}

export interface Transaction {
	title: string;
	from: string;
	to: Record<string, number>;
	date: Timestamp;
	category: TransactionCategory;
}

export interface Invite {
	expiry: Timestamp;
}
