<script setup lang="ts">
import { Button } from "primevue";
import { useRoute } from "vue-router";
import { useGroup } from "../../composables/useGroup";
import { type GroupUserData } from "../../firebase/types";
import { formatCurrency } from "../../util/util";

const route = useRoute();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupId, groupData, users } = useGroup(routeGroupId);

function calculateBalance(balance: GroupUserData["balance"]): number {
	return Object.values(balance).reduce((acc, value) => acc + value, 0);
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="bg-zinc-700 w-80 rounded-lg p-2 flex justify-between" v-for="user in users">
			<div class="text-lg">{{ user.name }}</div>
			<div class="text-lg">
				{{ formatCurrency(calculateBalance(user.balance) / 100, groupData!.currency) }}
			</div>
		</div>
	</div>

	<div>
		<router-link to="/settleUp">
			<Button label="Settle Up" />
		</router-link>
	</div>
</template>
