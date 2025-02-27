<script setup lang="ts">
import { Button, useToast } from "primevue";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePageTitle } from "../composables/usePageTitle";
import {
	getGroupData,
	getTransactions,
	getUsers,
	type GroupData,
	type GroupUserData,
	type Transaction,
	type WithId,
} from "../firebase/firestore";
import GroupUsers from "./group/GroupOverview.vue";
import GroupTransactions from "./group/GroupTransactions.vue";

const group = ref<GroupData | null>(null);
const transactions = ref<WithId<Transaction>[] | null>(null);
const users = ref<WithId<GroupUserData>[] | null>(null);

// todo use a global store for these ^

const pageNames = ["Overview", "Transactions"] as const;
type PageName = (typeof pageNames)[number];
const page = ref<PageName>("Overview");

const route = useRoute();
const router = useRouter();
const toast = useToast();
const setPageTitle = usePageTitle(null);

onMounted(async () => {
	function errorHome() {
		toast.add({
			severity: "error",
			summary: "Invalid Group",
			life: 2000,
		});

		router.push("/");
	}

	const groupId = !Array.isArray(route.params.groupId) ? route.params.groupId : null;
	if (!groupId) {
		errorHome();
		return;
	}

	const groupData = await getGroupData(groupId);
	if (!groupData) {
		errorHome();
		return;
	}

	group.value = groupData;
	setPageTitle(groupData.name);

	transactions.value = await getTransactions(groupId);
	users.value = await getUsers(groupId);
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

		<GroupUsers v-if="page === 'Overview'" :users="users ?? []" />
		<GroupTransactions v-else-if="page === 'Transactions'" :transactions="transactions ?? []" />

		<div class="fixed right-8 bottom-8">
			<Button icon="pi pi-plus" label="New Transaction" />
		</div>
	</div>
</template>
