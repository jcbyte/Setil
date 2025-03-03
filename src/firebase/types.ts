import type { Timestamp } from "firebase/firestore";
import type { Currency } from "../util/groupSettings";

export interface UserData {
	groups: string[];
}

export interface GroupData {
	name: string;
	currency: Currency;
	owner: string;
}

export interface GroupUserData {
	name: string;
	balance: Record<string, number>;
}

export interface Transaction {
	title: string;
	from: Record<string, number>;
	to: Record<string, number>;
	date: Timestamp;
}

export interface Invite {
	expiry: Timestamp;
}
