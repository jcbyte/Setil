import { resolveBalance } from "./util";

export type Currency = "gbp" | "usd" | "eur";

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
	const currencySettings = CurrencySettings[currency];
	const negative = amount < 0;
	return (negative ? "-" : "") + currencySettings.symbol + Math.abs(amount).toFixed(currencySettings.decimals);
}

export interface BalanceStr {
	str: string;
	status: "positive" | "negative" | "neutral";
}

export function getBalanceStr(
	balance: Record<string, number>,
	currency: Currency,
	positiveGenerator: (formattedBal: string) => string,
	negativeGenerator: (formattedBal: string) => string,
	neutralGenerator: () => string
): BalanceStr {
	const bal = resolveBalance(balance);
	const formattedBal = formatCurrency(Math.abs(bal), currency);

	let status: "positive" | "negative" | "neutral";
	let str: string;

	if (bal === 0) {
		status = "neutral";
		str = neutralGenerator();
	} else if (bal > 0) {
		status = "positive";
		str = positiveGenerator(formattedBal);
	} else {
		status = "negative";
		str = negativeGenerator(formattedBal);
	}

	return { str, status };
}
