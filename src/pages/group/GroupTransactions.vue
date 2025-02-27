<script setup lang="ts">
import type { Transaction, WithId } from "../../firebase/firestore";

defineProps<{
	transactions: WithId<Transaction>[];
}>();

function calculateTotalAmount(transactionAmounts: Record<string, number>): number {
	return Object.values(transactionAmounts).reduce((acc, value) => acc + value, 0);
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="bg-zinc-700 w-80 rounded-lg p-2 flex flex-col" v-for="transaction in transactions">
			<div class="flex justify-between">
				<div class="text-lg">{{ transaction.title }}</div>
				<div class="text-lg">{{ calculateTotalAmount(transaction.from) / 100 }}</div>
			</div>
			<div class="text-sm text-zinc-300">{{ transaction.date.toLocaleString() }}</div>
			<div class="text-sm">
				{{ `${Object.keys(transaction.from).join(", ")}->${Object.keys(transaction.to).join(", ")}` }}
			</div>
		</div>
	</div>
</template>
