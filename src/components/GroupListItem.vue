<script setup lang="ts">
import type { ExtendedGroupData } from "@/firebase/firestore";
import { getBalanceStr, type BalanceStr } from "@/util/util";
import { Timestamp } from "firebase/firestore";
import { computed } from "vue";
import AvatarStack from "./AvatarStack.vue";
import BalanceStrBadge from "./BalanceStrBadge.vue";

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

const yourBalanceStr = computed<BalanceStr>(() =>
	getBalanceStr(
		props.group.myself.balance,
		props.group.currency,
		(b) => `You're owed ${b}`,
		(b) => `You owe ${b}`,
		() => "Your all in balance"
	)
);
</script>

<template>
	<div class="flex justify-between border border-border rounded-lg p-4">
		<div class="flex flex-col gap-2">
			<div class="flex flex-col">
				<span class="text-lg font-semibold">{{ group.name }}</span>
				<span v-if="group.description" class="text-sm text-muted-foreground">{{ group.description }}</span>
			</div>
			<AvatarStack
				avatar-class="border border-background"
				:avatars="group.topUsers.map((topUser) => ({ src: topUser.photoURL, name: topUser.name }))"
				:total-count="group.userCount"
			/>
			<span class="text-sm text-muted-foreground">{{ lastUpdatedStr }}</span>
		</div>

		<div class="flex flex-col justify-between items-end">
			<i class="pi pi-chevron-right text-muted-foreground" />
			<BalanceStrBadge :balance-str="yourBalanceStr" />
		</div>
	</div>
</template>
