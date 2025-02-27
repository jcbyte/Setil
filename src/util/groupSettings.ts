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
