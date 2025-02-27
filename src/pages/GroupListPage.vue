<script setup lang="ts">
import { Button, Skeleton } from "primevue";
import { onMounted, ref } from "vue";
import { usePageTitle } from "../composables/usePageTitle";
import { getUserGroups, type GroupData } from "../firebase/firestore";

usePageTitle("Setil");

const groups = ref<Record<string, GroupData> | null>(null);

onMounted(() => {
	getUserGroups().then((g) => {
		groups.value = g;
		console.log(g);
	});
});
</script>

<template>
	<div class="flex flex-col items-center gap-4">
		<div v-if="groups" class="flex flex-col w-80 gap-2">
			<div
				class="bg-zinc-700 hover:bg-zinc-600 duration-300 cursor-pointer w-full rounded-lg p-2"
				v-for="(group, groupId) in groups"
			>
				<router-link :to="`/group/${groupId}`" class="flex justify-between items-center">
					<span class="text-lg">{{ group.name }}</span>
					<i class="pi pi-chevron-right" />
				</router-link>
			</div>
		</div>
		<div v-else class="flex flex-col w-80 gap-2">
			<Skeleton class="!w-full !h-11 !rounded-lg" />
			<Skeleton class="!w-full !h-11 !rounded-lg" />
			<Skeleton class="!w-full !h-11 !rounded-lg" />
		</div>

		<router-link to="/create" class="w-full">
			<Button severity="secondary" icon="pi pi-plus" label="New" fluid />
		</router-link>
	</div>
</template>
