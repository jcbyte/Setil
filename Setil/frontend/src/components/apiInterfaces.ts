export interface APIResponse {
	success: boolean;
}

export interface LoginDetails {
	username: string;
	password: string;
}

export interface AccountDetails extends LoginDetails {
	name: string;
}

export interface CreateAccountResponse extends APIResponse {
	name?: Array<String>;
	username?: Array<String>;
	password?: Array<String>;
}
