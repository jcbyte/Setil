const jwtLocalStorage = { access: "jwt_access", refresh: "jwt_refresh" };

export function obtainToken(username, password) {
	return fetch("/api/token/obtain", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username: username, password: password }),
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(response.status.toString());
			}
		})
		.then((data) => {
			localStorage.setItem(jwtLocalStorage.access, data.access);
			localStorage.setItem(jwtLocalStorage.refresh, data.refresh);
		});
}

export function refreshToken(): Promise<any> {
	return fetch("/api/token/refresh", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ refresh: localStorage.getItem(jwtLocalStorage.refresh) }),
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(response.status.toString());
			}
		})
		.then((data) => {
			localStorage.setItem(jwtLocalStorage.access, data.access);
		});
}

export function authFetch(input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> {
	init ??= {};
	init.headers = { ...init.headers, Authorization: "Bearer " + localStorage.getItem(jwtLocalStorage.access) };
	return fetch(input, init).then((res) => {
		if (res.status == 401) {
			return refreshToken().then(() => {
				return authFetch(input, init);
			});
		} else return res;
	});
}
