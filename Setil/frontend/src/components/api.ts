import { APIResponse, AccountDetails, CreateAccountResponse, GetGroupsResponse, LoginDetails } from "./apiInterfaces";
import { obtainToken, authFetch } from "./auth";

export function createAccount(account: AccountDetails): Promise<CreateAccountResponse> {
	return fetch("/api/user/create", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(account),
	}).then((res) => res.json());
}

export function login(account: LoginDetails): Promise<APIResponse> {
	return obtainToken(account)
		.then(() => {
			return { success: true };
		})
		.catch(() => {
			return { success: false };
		});
}

export function getGroups(): Promise<GetGroupsResponse | false> {
	return authFetch("/api/getGroups", {
		method: "GET",
	}).then((res) => {
		if (res) return res.json();
		return false;
	});
}
