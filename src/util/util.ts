export function splitAmount(amount: number, people: string[], multiplier: number = 100): Record<string, number> {
	const perPersonAmount = Math.floor((amount * multiplier) / people.length);
	const extraAmount = (amount * multiplier) % people.length;

	return Object.fromEntries(
		people.map((person, index) => [person, (perPersonAmount + (index < extraAmount ? 1 : 0)) / multiplier])
	);
}
