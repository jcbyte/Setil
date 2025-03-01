import { createRouter, createWebHistory } from "vue-router";
import CreateGroupPage from "./pages/CreateGroupPage.vue";
import GroupOverview from "./pages/group/GroupOverview.vue";
import GroupTransactions from "./pages/group/GroupTransactions.vue";
import GroupListPage from "./pages/GroupListPage.vue";
import GroupPage from "./pages/GroupPage.vue";
import NewTransactionPage from "./pages/newTransactionPage.vue";
import SettleUpPage from "./pages/SettleUpPage.vue";

const routes = [
	{
		path: "/",
		component: GroupListPage,
		name: "GroupListPage",
	},
	{
		path: "/create",
		component: CreateGroupPage,
		name: "CreateGroupPage",
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
		component: NewTransactionPage,
		name: "NewTransactionPage",
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
