<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type GroupData } from "@/firebase/types";
import { Timestamp } from "firebase/firestore";

defineProps<{
	group: GroupData;
}>();

function calculateLengthAgo(timestamp: Timestamp) {
	const deltaTime = Timestamp.now().seconds - timestamp.seconds;

	const intervals: { label: string; seconds: number }[] = [
		{ label: "year", seconds: 31536000 },
		{ label: "month", seconds: 2592000 },
		{ label: "week", seconds: 604800 },
		{ label: "day", seconds: 86400 },
		{ label: "hour", seconds: 3600 },
		{ label: "minute", seconds: 60 },
		{ label: "second", seconds: 1 },
	];

	const interval = intervals.find(({ seconds }) => Math.floor(deltaTime / seconds) >= 1);

	if (interval) {
		const count = Math.floor(deltaTime / interval.seconds);
		return `Updated ${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
	}

	return "Updated just now";
}

// todo implement avatars
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
			<span class="text-sm text-zinc-400">{{ calculateLengthAgo(group.lastUpdate) }}</span>
		</div>

		<div class="flex flex-col justify-between items-end">
			<i class="pi pi-chevron-right text-zinc-200" />
			<span class="text-sm bg-green-400/20 rounded-full px-1.5 py-0.5">(todo) your owed</span>
		</div>
	</div>
</template>
