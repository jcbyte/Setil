<script setup lang="ts">
import type { Group } from "../types";

defineProps<{
	group: Group;
}>();

function joinList(l: string[]): string {
	return l.join(", ");
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="text-xl">{{ group.name }}</div>
		<div class="bg-zinc-700 w-80 rounded-lg p-2 flex flex-col" v-for="transition in group.transactions">
			<div class="flex justify-between">
				<div class="text-lg">{{ transition.title }}</div>
				<div class="text-lg">{{ transition.amount }}</div>
			</div>
			<div class="text-sm text-zinc-300">{{ transition.date.toLocaleString() }}</div>
			<div class="text-sm">{{ `${joinList(transition.from)}->${joinList(transition.to)}` }}</div>
		</div>
	</div>
</template>
