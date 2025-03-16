import type { GroupUserData } from "@/firebase/types";
import { CurrencySettings, type Currency } from "./groupSettings";

export function splitAmount(amount: number, people: string[]): Record<string, number> {
	const perPersonAmount = Math.floor(amount / people.length);
	const extraAmount = amount % people.length;

	return Object.fromEntries(people.map((person, index) => [person, perPersonAmount + (index < extraAmount ? 1 : 0)]));
}

export function formatCurrency(amount: number, currency: Currency): string {
	const currencySettings = CurrencySettings[currency];
	const negative = amount < 0;
	return (negative ? "-" : "") + currencySettings.symbol + Math.abs(amount).toFixed(currencySettings.decimals);
}

export function resolveBalance(balance: GroupUserData["balance"]): number {
	return Object.values(balance).reduce((acc, value) => acc + value, 0);
}
