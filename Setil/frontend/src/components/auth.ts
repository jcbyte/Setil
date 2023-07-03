const jwtLocalStorage = {
	access: "jwt_access",
	refresh: "jwt_refresh",
	accessTimeout: "jwt_access_timeout",
	refreshTimeout: "jwt_refresh_timeout",
};
const jwtTimeout = {
	access: 1000 * 60 * 5, // 5 Minutes
	refresh: 1000 * 60 * 60 * 24, // 1 Day
};

import { LoginDetails } from "./apiInterfaces";

interface jwtAccessToken {
	access: string;
}
interface jwtRefreshToken {
	refresh: string;
}
interface jwtToken extends jwtAccessToken, jwtRefreshToken {}

function getJwtAccessToken(): jwtAccessToken {
	return {
		access: localStorage.getItem(jwtLocalStorage.access) ?? "",
	};
}

function getJwtRefreshToken(): jwtRefreshToken {
	return {
		refresh: localStorage.getItem(jwtLocalStorage.refresh) ?? "",
	};
}

function getJwtToken(): jwtToken {
	return { ...getJwtAccessToken(), ...getJwtRefreshToken() };
}

export function obtainToken(account: LoginDetails) {
	return fetch("/api/token/obtain", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(account),
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(response.status.toString());
			}
		})
		.then((data: jwtToken) => {
			var timenow = new Date().getTime();

			localStorage.setItem(jwtLocalStorage.access, data.access);
			localStorage.setItem(jwtLocalStorage.accessTimeout, (timenow + jwtTimeout.access).toString());
			localStorage.setItem(jwtLocalStorage.refresh, data.refresh);
			localStorage.setItem(jwtLocalStorage.refreshTimeout, (timenow + jwtTimeout.refresh).toString());

			return "200";
		});
}

export function refreshToken(): Promise<any> {
	return fetch("/api/token/refresh", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(getJwtRefreshToken()),
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(response.status.toString());
			}
		})
		.then((data: jwtAccessToken) => {
			var timenow = new Date().getTime();

			localStorage.setItem(jwtLocalStorage.access, data.access);
			localStorage.setItem(jwtLocalStorage.accessTimeout, (timenow + jwtTimeout.access).toString());

			return "200";
		});
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
	var timenow = new Date().getTime();
	if (timenow > +(localStorage.getItem(jwtLocalStorage.refreshTimeout) ?? "0")) return false;
	if (timenow > +(localStorage.getItem(jwtLocalStorage.accessTimeout) ?? "0")) await refreshToken();

	init ??= {};
	init.headers = { ...init.headers, Authorization: "Bearer " + getJwtAccessToken().access };
	return fetch(input, init);
}
