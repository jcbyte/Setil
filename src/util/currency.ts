import type { Currency } from "@/firebase/types";

export interface CurrencyData {
	name: string;
	symbol: string;
	decimals: number;
}

export const CurrencySettings: Record<Currency, CurrencyData> = {
	gbp: { name: "Pound Sterling", symbol: "£", decimals: 2 },
	usd: { name: "US Dollar", symbol: "$", decimals: 2 },
	eur: { name: "Euro", symbol: "€", decimals: 2 },
};

export function formatCurrency(amount: number, currency: Currency): string {
	const negative = amount < 0;
	const formattedAmount = Math.abs(amount / Math.pow(10, CurrencySettings[currency].decimals)).toFixed(
		CurrencySettings[currency].decimals
	);
	return `${negative ? "-" : ""}${CurrencySettings[currency].symbol}${formattedAmount}`;
}

export function toFirestoreAmount(amount: number, currency: Currency): number {
	return Math.floor(amount * Math.pow(10, CurrencySettings[currency].decimals));
}

export interface BalanceStr {
	str: string;
	status: "positive" | "negative" | "neutral";
}

export function getBalanceStr(
	balance: number,
	currency: Currency,
	positiveGenerator: (formattedBal: string) => string,
	negativeGenerator: (formattedBal: string) => string,
	neutralGenerator: () => string
): BalanceStr {
	const formattedBal = formatCurrency(Math.abs(balance), currency);

	let status: "positive" | "negative" | "neutral";
	let str: string;

	if (balance === 0) {
		status = "neutral";
		str = neutralGenerator();
	} else if (balance > 0) {
		status = "positive";
		str = positiveGenerator(formattedBal);
	} else {
		status = "negative";
		str = negativeGenerator(formattedBal);
	}

	return { str, status };
}
