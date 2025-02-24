<script setup lang="ts">
import { useToast } from "primevue";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePageTitle } from "../composables/usePageTitle";
import { getGroupData, type GroupData } from "../firebase/firestore";

const group = ref<GroupData | null>(null);
const route = useRoute();
const router = useRouter();
const toast = useToast();
const setPageTitle = usePageTitle("Group");

onMounted(() => {
	function returnHome() {
		toast.add({
			severity: "error",
			summary: "Invalid Group",
			life: 2000,
		});

		router.push("/");
	}

	const groupId = !Array.isArray(route.params.groupId) ? route.params.groupId : null;
	if (!groupId) {
		returnHome();
		return;
	}

	getGroupData(groupId).then((data) => {
		if (!data) {
			returnHome();
			return;
		}

		group.value = data;
		setPageTitle(data.name);
	});
});

function joinList(l: string[]): string {
	return l.join(", ");
}
</script>

<!-- todo -->

<template>
	<div class="flex flex-col gap-2">
		<!-- <div class="bg-zinc-700 w-80 rounded-lg p-2 flex flex-col" v-for="transition in group.transactions">
			<div class="flex justify-between">
				<div class="text-lg">{{ transition.title }}</div>
				<div class="text-lg">{{ transition.amount }}</div>
			</div>
			<div class="text-sm text-zinc-300">{{ transition.date.toLocaleString() }}</div>
			<div class="text-sm">{{ `${joinList(transition.from)}->${joinList(transition.to)}` }}</div>
		</div> -->
	</div>
</template>
