<script setup lang="ts">
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Separator from "@/components/ui/separator/Separator.vue";
import type { GroupData, GroupUserData, Transaction } from "@/firebase/types";
import { formatCurrency } from "@/util/util";
import { computed } from "vue";
import { useRouter } from "vue-router";
import Button from "./ui/button/Button.vue";

const props = defineProps<{
	groupId: string;
	groupData: GroupData;
	users: Record<string, GroupUserData>;
	transactions: Record<string, Transaction>;
}>();

const router = useRouter();

function calculateTotalTransactionValue(transactionAmounts: Record<string, number>): number {
	return Object.values(transactionAmounts).reduce((acc, value) => acc + value, 0);
}

const sortedTransactions = computed(() => {
	return Object.entries(props.transactions).sort(
		([, transactionA]: [string, Transaction], [, transactionB]: [string, Transaction]) => {
			return transactionB.date.seconds - transactionA.date.seconds;
		}
	);
});
</script>

<template>
	<div class="flex flex-col gap-2 border border-zinc-800 rounded-lg p-4">
		<div class="flex flex-col">
			<span class="text-lg font-semibold">Group Activity</span>
			<span class="text-sm text-zinc-400">Transactions in this group</span>
		</div>
		<div class="flex flex-col">
			<div v-for="([transactionId, transaction], index) in sortedTransactions">
				<div class="flex flex-col">
					<div class="flex justify-between items-center">
						<div class="flex items-center gap-3">
							<div class="bg-zinc-800 rounded-lg size-9 p-2 flex justify-center items-center">
								<i class="pi pi-receipt" />
							</div>
							<div class="flex flex-col">
								<div class="text-lg font-semibold">{{ transaction.title }}</div>
								<div class="flex justify-center items-center gap-3">
									<div class="flex justify-center items-center gap-1">
										<i class="pi pi-calendar !text-sm text-zinc-400" />
										<span class="text-sm text-zinc-400">{{ transaction.date.toDate().toLocaleDateString() }}</span>
									</div>
									<div class="flex justify-center items-center gap-1">
										<i class="pi pi-user !text-sm text-zinc-400" />
										<span class="text-sm text-zinc-400">{{ users[transaction.from].name }}</span>
									</div>
								</div>
							</div>
						</div>
						<div class="flex justify-center items-center gap-2">
							<span class="text-lg">
								{{ formatCurrency(calculateTotalTransactionValue(transaction.to) / 100, groupData.currency) }}
							</span>
							<DropdownMenu>
								<DropdownMenuTrigger as-child>
									<Button variant="ghost" class="size-8">
										<i class="pi pi-ellipsis-v !text-[14px]" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem @click="router.push(`/group/${groupId}/transaction/${transactionId}`)">
										<div class="w-full flex justify-between">
											<span>Edit</span>
											<i class="pi pi-pencil" />
										</div>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem @click="console.log('todo delete transition')">
										<div class="w-full flex justify-between">
											<span class="text-red-400">Delete</span>
											<i class="pi pi-trash text-red-400" />
										</div>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					<Separator v-if="index < sortedTransactions.length - 1" class="my-2" />
				</div>
			</div>
		</div>
	</div>
</template>
