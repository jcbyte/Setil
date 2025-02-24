<script setup lang="ts">
import { Button, Skeleton } from "primevue";
import { inject, onMounted, ref, type Ref } from "vue";
import { getUserGroups, type UserGroup } from "../firebase/firestore";

const pageTitle = inject<Ref<string>>("pageTitle");

const groups = ref<UserGroup[] | null>(null);

onMounted(() => {
	getUserGroups().then((g) => {
		groups.value = g;
	});

	if (pageTitle) {
		pageTitle.value = "Groups";
	}
});
</script>

<template>
	<div class="flex flex-col items-center gap-4 p-4">
		<div v-if="groups" class="flex flex-col w-80 gap-2">
			<div
				class="bg-zinc-700 hover:bg-zinc-600 duration-300 cursor-pointer w-full rounded-lg p-2 flex justify-between items-center"
				v-for="group in groups"
			>
				<div class="text-lg">{{ group.name }}</div>
				<i class="pi pi-chevron-right" />
			</div>
		</div>
		<div v-else class="flex flex-col w-80 gap-2">
			<Skeleton class="!w-full !h-11 !rounded-lg" />
			<Skeleton class="!w-full !h-11 !rounded-lg" />
			<Skeleton class="!w-full !h-11 !rounded-lg" />
		</div>

		<Button class="w-80">
			<!-- todo create group -->
			<i class="pi pi-plus" />
		</Button>
	</div>
</template>
