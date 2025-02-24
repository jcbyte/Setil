import { createRouter, createWebHistory } from "vue-router";
import CreateGroupPage from "./pages/CreateGroupPage.vue";
import GroupListPage from "./pages/GroupListPage.vue";
import GroupPage from "./pages/GroupPage.vue";

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
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
