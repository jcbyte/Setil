function gcd(a: number, b: number): number {
	if (b === 0) return a;
	return gcd(b, a % b);
}

export function gcdN(numbers: number[]): number {
	return numbers.reduce((acc, val) => gcd(acc, val));
}
