<script setup lang="ts">
import { Button } from "primevue";
import { type GroupUserData } from "../../firebase/types";
import { useGroupStore } from "../../stores/useGroupStore";
import { formatCurrency } from "../../util/util";

const groupStore = useGroupStore();

function calculateBalance(balance: GroupUserData["balance"]): number {
	return Object.values(balance).reduce((acc, value) => acc + value, 0);
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="bg-zinc-700 w-80 rounded-lg p-2 flex justify-between" v-for="user in groupStore.users">
			<div class="text-lg">{{ user.name }}</div>
			<div class="text-lg">
				{{ formatCurrency(calculateBalance(user.balance) / 100, groupStore.groupData!.currency) }}
			</div>
		</div>
	</div>

	<div>
		<Button label="Settle up" />
	</div>
</template>
