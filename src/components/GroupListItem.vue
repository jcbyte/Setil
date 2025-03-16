<script setup lang="ts">
import type { ExtendedGroupData } from "@/firebase/firestore";
import { formatCurrency, resolveBalance } from "@/util/util";
import { Timestamp } from "firebase/firestore";
import { computed } from "vue";
import AvatarStack from "./AvatarStack.vue";

const props = defineProps<{
	group: ExtendedGroupData;
}>();

const lastUpdatedStr = computed<string>(() => {
	const deltaTime = Timestamp.now().seconds - props.group.lastUpdate.seconds;

	const intervals: { label: string; seconds: number }[] = [
		{ label: "year", seconds: 31536000 },
		{ label: "month", seconds: 2592000 },
		{ label: "week", seconds: 604800 },
		{ label: "day", seconds: 86400 },
		{ label: "hour", seconds: 3600 },
		{ label: "minute", seconds: 60 },
	];

	const interval = intervals.find(({ seconds }) => Math.floor(deltaTime / seconds) >= 1);

	if (interval) {
		const count = Math.floor(deltaTime / interval.seconds);
		return `Updated ${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
	}

	return "Updated just now";
});

const yourBalanceStr = computed<{ str: string; status: "positive" | "negative" | "neutral" }>(() => {
	const bal = resolveBalance(props.group.myself.balance);
	const formattedBal = formatCurrency(Math.abs(bal), props.group.currency);

	let status: "positive" | "negative" | "neutral";
	let str: string;

	if (bal === 0) {
		status = "neutral";
		str = "Your all in balance";
	} else if (bal > 0) {
		status = "positive";
		str = `You're owed ${formattedBal}`;
	} else {
		status = "negative";
		str = `You owe ${formattedBal}`;
	}

	return { str, status };
});
</script>

<template>
	<div class="flex justify-between border border-zinc-800 rounded-lg p-4">
		<div class="flex flex-col gap-2">
			<div class="flex flex-col">
				<span class="text-lg font-semibold">{{ group.name }}</span>
				<span v-if="group.description" class="text-sm text-zinc-400">{{ group.description }}</span>
			</div>
			<AvatarStack
				avatar-class="border border-zinc-950"
				:avatars="group.topUsers.map((topUser) => ({ src: topUser.photoURL, name: topUser.name }))"
				:total-count="group.userCount"
			/>
			<span class="text-sm text-zinc-400">{{ lastUpdatedStr }}</span>
		</div>

		<div class="flex flex-col justify-between items-end">
			<i class="pi pi-chevron-right text-zinc-200" />
			<span
				:class="`text-sm ${
					yourBalanceStr.status !== 'neutral'
						? yourBalanceStr.status === 'positive'
							? 'bg-green-400/20'
							: 'bg-red-400/20'
						: ''
				} rounded-full px-1.5 py-0.5`"
				>{{ yourBalanceStr.str }}</span
			>
		</div>
	</div>
</template>
