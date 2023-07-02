export interface LoginDetails {
	username: string;
	password: string;
}

export interface AccountDetails extends LoginDetails {
	name: string;
}

export interface APIResponse {
	success: boolean;
}

export interface CreateAccountResponse extends APIResponse {
	name?: Array<String>;
	username?: Array<String>;
	password?: Array<String>;
}

export function createAccount(account: AccountDetails): Promise<CreateAccountResponse> {
	return fetch("/api/user/create", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(account),
	}).then((res) => res.json());
}
