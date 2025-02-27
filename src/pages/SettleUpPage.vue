<script setup lang="ts">
import { computed } from "vue";
import type { GroupUserData } from "../firebase/types";
import { useGroupStore } from "../stores/useGroupStore";
import { formatCurrency } from "../util/util";

const groupStore = useGroupStore();

const usersWithTransactions = computed<Record<string, GroupUserData>>(() => {
	return Object.fromEntries(
		Object.entries(groupStore.users!).filter(([userId, userData]) =>
			Object.values(userData.balance).some((balance) => balance < 0)
		)
	);
});
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="bg-zinc-700 w-80 rounded-lg p-2 flex flex-col" v-for="(user, userId) in usersWithTransactions">
			<div class="text-lg">{{ user.name }}</div>
			<div class="text-md" v-for="(otherUserBalance, otherUserId) in user.balance">
				<div v-if="otherUserBalance < 0">
					Send {{ formatCurrency(-otherUserBalance / 100, groupStore.groupData!.currency) }} to
					{{ groupStore.users![otherUserId].name }}
				</div>
			</div>
		</div>
	</div>
</template>
