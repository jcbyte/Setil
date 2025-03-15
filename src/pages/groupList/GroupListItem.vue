<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type GroupData } from "../../firebase/types";

defineProps<{
	group: GroupData;
}>();
</script>

<template>
	<div class="flex flex-col gap-2 border border-zinc-800 rounded-lg p-4">
		<div class="flex justify-between items-center">
			<div class="flex flex-col">
				<span class="text-lg font-semibold">{{ group.name }}</span>
				<span class="text-sm text-zinc-400">(todo) group description</span>
			</div>
			<i class="pi pi-chevron-right" />
		</div>
		<div class="flex justify-between items-center">
			<Avatar>
				<AvatarImage src="https://github.com/unovue.png" alt="@unovue" />
				<AvatarFallback>CN</AvatarFallback>
			</Avatar>
			<span class="text-sm">(todo) total expenditure</span>
		</div>
		<div class="flex justify-between items-center">
			<span class="text-sm text-zinc-400">Updated (todo) days ago</span>
			<span class="text-sm bg-green-800 rounded-lg px-1">(todo) your owed</span>
		</div>
	</div>
</template>
