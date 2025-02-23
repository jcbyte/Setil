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
	owner: string;
	users: GroupUser[];
	transactions: Transaction[];
}
