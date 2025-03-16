<script setup lang="ts">
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Separator from "@/components/ui/separator/Separator.vue";
import { deleteTransaction } from "@/firebase/firestore";
import type { GroupData, GroupUserData, Transaction } from "@/firebase/types";
import { formatCurrency } from "@/util/util";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import Button from "./ui/button/Button.vue";

const props = defineProps<{
	groupId: string;
	groupData: GroupData;
	users: Record<string, GroupUserData>;
	transactions: Record<string, Transaction>;
}>();

const router = useRouter();

const deleteConfirmationDialog = ref<{ open: boolean; transactionId: string; processing: boolean }>({
	open: false,
	transactionId: "",
	processing: false,
});

const sortedTransactions = computed(() => {
	return Object.entries(props.transactions).sort(
		([, transactionA]: [string, Transaction], [, transactionB]: [string, Transaction]) => {
			return transactionB.date.seconds - transactionA.date.seconds;
		}
	);
});

function calculateTotalTransactionValue(transactionAmounts: Record<string, number>): number {
	return Object.values(transactionAmounts).reduce((acc, value) => acc + value, 0);
}

function openDeleteConfirmDialog(transactionId: string) {
	deleteConfirmationDialog.value = { open: true, transactionId: transactionId, processing: false };
}

function closeDeleteConfirmDialog() {
	deleteConfirmationDialog.value.open = false;
}

async function handleDeleteTransaction() {
	deleteConfirmationDialog.value.processing = true;

	await deleteTransaction(props.groupId, deleteConfirmationDialog.value.transactionId);

	closeDeleteConfirmDialog();
}
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
									<DropdownMenuItem @click="openDeleteConfirmDialog(transactionId)">
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

	<AlertDialog v-model:open="deleteConfirmationDialog.open">
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
				<AlertDialogDescription>
					This cannot be undone and will permanently delete the transaction.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<Button variant="outline" :disabled="deleteConfirmationDialog.processing" @click="closeDeleteConfirmDialog">
					Cancel
				</Button>
				<Button variant="destructive" :disabled="deleteConfirmationDialog.processing" @click="handleDeleteTransaction">
					<i :class="`pi ${deleteConfirmationDialog.processing ? 'pi-spin pi-spinner' : 'pi-trash'}`" />
					<span>Delete</span>
				</Button>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</template>
