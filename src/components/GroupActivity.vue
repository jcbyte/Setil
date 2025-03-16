<script setup lang="ts">
import { useGroup } from "@/composables/useGroup";
import type { Transaction } from "@/firebase/types";
import { formatCurrency } from "@/util/util";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupId, groupData, users, transactions } = useGroup(routeGroupId);

function calculateTotalAmount(transactionAmounts: Record<string, number>): number {
	return Object.values(transactionAmounts).reduce((acc, value) => acc + value, 0);
}

function getTransactionUsers(transactionPart: Record<string, number>): string {
	return Object.keys(transactionPart)
		.map((userId) => users.value![userId].name)
		.join(", ");
}

const sortedTransactions = computed((): any | null => {
	if (!transactions.value) return null;

	return Object.entries(transactions.value).sort(
		([, transactionA]: [string, Transaction], [, transactionB]: [string, Transaction]) => {
			return transactionB.date.seconds - transactionA.date.seconds;
		}
	);
});
</script>

<template>
	<div class="flex flex-col gap-2">
		<div
			class="bg-zinc-700 hover:bg-zinc-600 duration-300 cursor-pointer w-80 rounded-lg p-2 flex flex-col"
			v-for="[transactionId, transaction] in sortedTransactions"
			@click="router.push(`/group/${groupId}/transaction/${transactionId}`)"
		>
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
