import { AccountDetails, CreateAccountResponse, LoginDetails } from "./apiInterfaces";

export function createAccount(account: AccountDetails): Promise<CreateAccountResponse> {
	return fetch("/api/user/create", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(account),
	}).then((res) => res.json());
}

export function login(account: LoginDetails) {}
