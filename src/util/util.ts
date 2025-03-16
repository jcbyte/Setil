import { cleanupInvites, invite } from "@/firebase/firestore";
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

export function getBalanceStr(
	balance: GroupUserData["balance"],
	currency: Currency,
	positiveGenerator: (formattedBal: string) => string,
	negativeGenerator: (formattedBal: string) => string,
	neutralGenerator: () => string
): { str: string; status: "positive" | "negative" | "neutral" } {
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

export async function inviteUser(groupId: string) {
	// Cleanup old invites
	await cleanupInvites(groupId);

	// Create invite
	const inviteCode = await invite(groupId, 24 * 60 * 60 * 1000);
	const inviteLink = `${window.location.origin}/invite/${groupId}/${inviteCode}`;
	const sharedData = {
		title: "Setil",
		text: "Join my Setil Group!",
		url: inviteLink,
	};

	// If this can be shared then share it
	if (navigator.canShare(sharedData)) {
		await navigator.share(sharedData);
	} else {
		// Else copy to clipboard and display a confirmation
		await navigator.clipboard.writeText(inviteLink).then(() => {
			// todo show toast success
			// toast.add({
			// 	severity: "info",
			// 	summary: "Copied invite link to Clipboard",
			// 	life: 5000,
			// });
		});
	}
}
