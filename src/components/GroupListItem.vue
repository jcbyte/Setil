<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type GroupData } from "../firebase/types";

defineProps<{
	group: GroupData;
}>();

// todo implement rest of this once data is available
</script>

<template>
	<div class="flex justify-between border border-zinc-800 rounded-lg p-4">
		<div class="flex flex-col gap-2">
			<div class="flex flex-col">
				<span class="text-lg font-semibold">{{ group.name }}</span>
				<span v-if="group.description" class="text-sm text-zinc-400">{{ group.description }}</span>
			</div>
			<Avatar>
				<AvatarImage src="https://github.com/unovue.png" alt="@unovue" />
				<AvatarFallback>CN</AvatarFallback>
			</Avatar>
			<span class="text-sm text-zinc-400">Updated (todo) days ago</span>
		</div>

		<div class="flex flex-col justify-between items-end">
			<i class="pi pi-chevron-right" />
			<span class="text-sm bg-green-400/20 rounded-full px-1.5 py-0.5">(todo) your owed</span>
		</div>
	</div>
</template>
