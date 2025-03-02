import { createRouter, createWebHistory } from "vue-router";
import GroupOverview from "./pages/group/GroupOverview.vue";
import GroupTransactions from "./pages/group/GroupTransactions.vue";
import GroupDetailsPage from "./pages/GroupDetailsPage.vue";
import GroupListPage from "./pages/GroupListPage.vue";
import GroupPage from "./pages/GroupPage.vue";
import SettleUpPage from "./pages/SettleUpPage.vue";
import TransactionPage from "./pages/TransactionPage.vue";

const routes = [
	{
		path: "/",
		component: GroupListPage,
		name: "GroupListPage",
	},
	{
		path: "/create",
		component: GroupDetailsPage,
		name: "CreateGroupPage",
	},
	{
		path: "/group/:groupId/edit",
		component: GroupDetailsPage,
		name: "EditGroupPage",
	},
	{
		path: "/group/:groupId",
		component: GroupPage,
		name: "GroupPage",
		children: [
			{
				path: "",
				component: GroupOverview,
				name: "GroupOverview",
			},
			{
				path: "transactions",
				component: GroupTransactions,
				name: "GroupTransactions",
			},
		],
	},
	{
		path: "/group/:groupId/transaction",
		component: TransactionPage,
		name: "NewTransactionPage",
	},
	{
		path: "/group/:groupId/transaction/:transactionId",
		component: TransactionPage,
		name: "EditTransactionPage",
	},
	{
		path: "/group/:groupId/settle",
		component: SettleUpPage,
		name: "SettleUpPage",
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
