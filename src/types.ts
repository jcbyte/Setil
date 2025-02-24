interface GroupUser {
	id: string;
	name: string;
}

interface Transaction {
	title: string;
	amount: number;
	from: string[];
	to: string[];
	date: Date;
}

export interface Group {
	name: string;
	users: GroupUser[];
	transactions: Transaction[];
}

export interface UserData {
	groups: string[];
}

export const DEFAULT_USER_DATA: UserData = { groups: [] };
