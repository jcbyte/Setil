export interface UK_PaymentDetails {
	name: string;
	sortCode: string;
	accountNumber: string;
}

export interface US_PaymentDetails {
	name: string;
	routingNumber: string;
	accountNumber: string;
}

export interface SEPA_PaymentDetails {
	name: string;
	IBAN: string;
	BIC?: string;
}

export interface SWIFT_PaymentDetails {
	name: string;
	IBAN: string;
	SWIFT: string;
}

export type PaymentDetails =
	| { type: "none" }
	| ({ type: "UK" } & UK_PaymentDetails)
	| ({ type: "US" } & US_PaymentDetails)
	| ({ type: "SEPA" } & SEPA_PaymentDetails)
	| ({ type: "SWIFT" } & SWIFT_PaymentDetails);
