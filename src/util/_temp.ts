import { resolveBalance } from "@/util/util";

export function resolveGroupDebts(
	debts: Record<string, Record<string, number>>
): Record<string, Record<string, number>> {
	// Calculate net balances for each user
	const balances = Object.fromEntries(
		Object.entries(debts).map(([userId, userDebts]) => [userId, resolveBalance(userDebts)])
	);

	// Separate users globally in credit/debt
	const { creditors, debtors } = Object.entries(balances).reduce<{ creditors: string[]; debtors: string[] }>(
		({ creditors, debtors }, [userId, resolvedDebt]) => {
			if (resolvedDebt > 0) creditors.push(userId);
			else if (resolvedDebt < 0) debtors.push(userId);
			return { creditors, debtors };
		},
		{ creditors: [], debtors: [] }
	);

	const newDebts: { from: string; to: string; amount: number }[] = [];

	// Match debtors and creditors to minimise transactions
	let currentCreditor = 0;
	let currentDebtor = 0;

	while (currentCreditor < creditors.length && currentDebtor < debtors.length) {
		const creditor = creditors[currentCreditor];
		const debtor = debtors[currentDebtor];

		// Determine the max amount that can be settled between these two users
		const amount = Math.min(Math.abs(balances[creditor]), Math.abs(balances[debtor]));

		// Add this transaction
		newDebts.push({ from: debtor, to: creditor, amount });

		// Subtract remaining debts of these users
		balances[creditor] -= amount;
		balances[debtor] += amount;

		// If this creditor/debtor is in ballance then move to the next one
		if (balances[creditor] === 0) currentCreditor++;
		if (balances[debtor] === 0) currentDebtor++;
	}

	// Format the debts back into an expected format
	const formattedDebts = newDebts.reduce<Record<string, Record<string, number>>>((formattedDebts, newDebt) => {
		if (!formattedDebts[newDebt.from]) formattedDebts[newDebt.from] = {};
		if (!formattedDebts[newDebt.from][newDebt.to]) formattedDebts[newDebt.from][newDebt.to] = 0;
		if (!formattedDebts[newDebt.to]) formattedDebts[newDebt.to] = {};
		if (!formattedDebts[newDebt.to][newDebt.from]) formattedDebts[newDebt.to][newDebt.from] = 0;

		formattedDebts[newDebt.from][newDebt.to] -= newDebt.amount;
		formattedDebts[newDebt.to][newDebt.from] += newDebt.amount;

		return formattedDebts;
	}, {});

	return formattedDebts;
}
