export interface AccountDetails {
	name: string;
	username: string;
	password: string;
}

export function createAccount(account: AccountDetails) {
	return fetch("/api/user/create", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(account),
	}).then((res) => res.json());
}
