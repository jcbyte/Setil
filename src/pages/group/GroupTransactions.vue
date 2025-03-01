<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useGroup } from "../../composables/useGroup";
import { getTransactions } from "../../firebase/firestore";
import { type Transaction } from "../../firebase/types";
import { formatCurrency } from "../../util/util";

const transactions = ref<Record<string, Transaction> | null>(null);

const route = useRoute();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupId, groupData, users } = useGroup(routeGroupId, async () => {
	transactions.value = await getTransactions(groupId.value!);
});

function calculateTotalAmount(transactionAmounts: Record<string, number>): number {
	return Object.values(transactionAmounts).reduce((acc, value) => acc + value, 0);
}

function getTransactionUsers(transactionPart: Record<string, number>): string {
	return Object.keys(transactionPart)
		.map((userId) => users.value![userId].name)
		.join(", ");
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="bg-zinc-700 w-80 rounded-lg p-2 flex flex-col" v-for="transaction in transactions">
			<div class="flex justify-between">
				<div class="text-lg">{{ transaction.title }}</div>
				<div class="text-lg">
					{{ formatCurrency(calculateTotalAmount(transaction.from) / 100, groupData!.currency) }}
				</div>
			</div>
			<div class="text-sm text-zinc-300">{{ transaction.date.toDate().toLocaleDateString() }}</div>
			<div class="text-sm">
				{{ `${getTransactionUsers(transaction.from)} -> ${getTransactionUsers(transaction.to)}` }}
			</div>
		</div>
	</div>
</template>
