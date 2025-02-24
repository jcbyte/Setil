<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getUserGroups } from "../firebase/firestore";

const groups = ref<string[]>([]);

onMounted(() => {
	getUserGroups().then((g) => {
		groups.value = g;
	});
});
</script>

<template>
	<div class="flex flex-col w-80 gap-2 p-4">
		<!-- todo show something else whilst loading -->
		<!-- todo show group name not just id -->
		<div
			class="bg-zinc-700 hover:bg-zinc-600 duration-300 cursor-pointer w-full rounded-lg p-2 flex justify-between items-center"
			v-for="group in groups"
		>
			<div class="text-lg">{{ group }}</div>
			<i class="pi pi-chevron-right" />
		</div>
	</div>
</template>
