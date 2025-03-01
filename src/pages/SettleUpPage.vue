<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useGroup } from "../composables/useGroup";
import type { GroupUserData } from "../firebase/types";
import { formatCurrency } from "../util/util";

const route = useRoute();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupData, users } = useGroup(routeGroupId);

const usersWithTransactions = computed<Record<string, GroupUserData>>(() => {
	return Object.fromEntries(
		Object.entries(users.value!).filter(([_userId, userData]) =>
			Object.values(userData.balance).some((balance) => balance < 0)
		)
	);
});
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="bg-zinc-700 w-80 rounded-lg p-2 flex flex-col" v-for="(user, _userId) in usersWithTransactions">
			<div class="text-lg">{{ user.name }}</div>
			<div class="text-md" v-for="(otherUserBalance, otherUserId) in user.balance">
				<div v-if="otherUserBalance < 0">
					Send {{ formatCurrency(-otherUserBalance / 100, groupData!.currency) }} to
					{{ users![otherUserId].name }}
				</div>
			</div>
		</div>
	</div>
</template>
