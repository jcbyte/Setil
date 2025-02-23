import { createRouter, createWebHistory } from "vue-router";
import GroupListPage from "./pages/GroupListPage.vue";
import GroupPage from "./pages/GroupPage.vue";

const routes = [
	{
		path: "/",
		component: GroupListPage,
		name: "GroupListPage",
	},
	{
		path: "/group",
		component: GroupPage,
		name: "GroupPage",
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
