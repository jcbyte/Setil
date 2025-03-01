<script setup lang="ts">
import { Button } from "primevue";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useGroup } from "../composables/useGroup";
import { usePageTitle } from "../composables/usePageTitle";
import GroupUsers from "./group/GroupOverview.vue";
import GroupTransactions from "./group/GroupTransactions.vue";

const pageNames = ["Overview", "Transactions"] as const;
type PageName = (typeof pageNames)[number];
const page = ref<PageName>("Overview");

const route = useRoute();
const setPageTitle = usePageTitle();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupId, groupData, users } = useGroup(routeGroupId, () => {
	setPageTitle(groupData.value?.name ?? "Unknown Group");
});
</script>

<template>
	<div class="flex flex-col gap-4 items-center">
		<div class="w-96 flex gap-2">
			<div
				v-for="pageName in pageNames"
				:class="`flex-1 ${
					page === pageName ? 'bg-zinc-500' : 'bg-zinc-700 hover:bg-zinc-600'
				} duration-300 p-2 rounded-lg cursor-pointer text-center`"
				@click="page = pageName"
			>
				{{ pageName }}
			</div>
		</div>

		<GroupUsers v-if="page === 'Overview'" />
		<GroupTransactions v-else-if="page === 'Transactions'" />

		<div class="fixed right-8 bottom-8">
			<router-link to="/newTransaction">
				<Button icon="pi pi-plus" label="New Transaction" />
			</router-link>
		</div>
	</div>
</template>
