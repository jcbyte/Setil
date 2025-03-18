<script setup lang="ts">
import type { GroupData, GroupUserData } from "@/firebase/types";
import { getBalanceStr } from "@/util/util";
import { computed } from "vue";
import Avatar from "./Avatar.vue";

const props = defineProps<{
	groupData: GroupData;
	users: Record<string, GroupUserData>;
}>();

const usersBalanceStr = computed<Record<string, { str: string; status: "positive" | "negative" | "neutral" }>>(() => {
	return Object.fromEntries(
		Object.entries(props.users).map(([userId, user]) => [
			userId,
			getBalanceStr(
				user.balance,
				props.groupData.currency,
				(b) => `is owed ${b}`,
				(b) => `owes ${b}`,
				() => "is in balance"
			),
		])
	);
});
</script>

<template>
	<div class="flex flex-col gap-2 border border-zinc-800 rounded-lg p-4">
		<div class="flex flex-col">
			<span class="text-lg font-semibold">Balances</span>
			<span class="text-sm text-muted-foreground">Who owes what in this group</span>
		</div>
		<div class="flex flex-col gap-2">
			<div v-for="(user, userId) in users" class="flex justify-between items-center">
				<div class="flex justify-center items-center gap-1">
					<Avatar :src="user.photoURL" :name="user.name" class="size-9" />
					<span>{{ user.name }}</span>
				</div>
				<span
					:class="`text-sm ${
						usersBalanceStr[userId].status !== 'neutral'
							? usersBalanceStr[userId].status === 'positive'
								? 'bg-green-400/20'
								: 'bg-red-400/20'
							: ''
					} rounded-full px-1.5 py-0.5 h-fit`"
					>{{ usersBalanceStr[userId].str }}</span
				>
			</div>
		</div>
	</div>
</template>
