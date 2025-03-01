<script setup lang="ts">
import { Button } from "primevue";
import { useRoute, useRouter } from "vue-router";
import { useGroup } from "../composables/useGroup";
import { usePageTitle } from "../composables/usePageTitle";

interface SubPage {
	name: string;
	routeName: string;
	link: (groupId: string) => string;
}
const subpages: SubPage[] = [
	{ name: "Overview", routeName: "GroupOverview", link: (groupId) => `/group/${groupId}` },
	{ name: "Transactions", routeName: "GroupTransactions", link: (groupId) => `/group/${groupId}/transactions` },
];

const route = useRoute();
const router = useRouter();
const setPageTitle = usePageTitle();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupId, groupData } = useGroup(routeGroupId, () => {
	setPageTitle(groupData.value?.name ?? "Unknown Group");
});

function navigateTo(link: SubPage["link"]) {
	router.push(link(groupId.value!));
}
</script>

<template>
	<div class="flex flex-col gap-4 items-center">
		<div class="w-96 flex gap-2">
			<div
				v-for="subpage in subpages"
				:class="`flex-1 ${
					route.name === subpage.routeName ? 'bg-zinc-500' : 'bg-zinc-700 hover:bg-zinc-600'
				} duration-300 p-2 rounded-lg cursor-pointer text-center`"
				@click="navigateTo(subpage.link)"
			>
				{{ subpage.name }}
			</div>
		</div>

		<router-view />

		<div class="fixed right-8 bottom-8">
			<router-link :to="`/group/${groupId}/transaction`">
				<Button icon="pi pi-plus" label="New Transaction" />
			</router-link>
		</div>
	</div>
</template>
