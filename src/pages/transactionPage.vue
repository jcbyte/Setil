<script setup lang="ts">
import { Form, type FormResolverOptions, type FormSubmitEvent } from "@primevue/forms";
import { Timestamp } from "firebase/firestore";
import { Button, DatePicker, FloatLabel, InputNumber, InputText, Message, MultiSelect, useToast } from "primevue";
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGroup } from "../composables/useGroup";
import {
	createTransaction,
	deleteTransaction as firestoreDeleteTransaction,
	updateTransaction,
} from "../firebase/firestore";
import type { Transaction } from "../firebase/types";
import { splitAmount } from "../util/util";

const router = useRouter();
const toast = useToast();
const route = useRoute();

const updatingTransaction = ref<boolean>(false);

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const routeTransactionId = Array.isArray(route.params.transactionId)
	? route.params.transactionId[0]
	: route.params.transactionId || null;

const { groupId, users, transactions } = useGroup(routeGroupId, () => {
	if (routeTransactionId) {
		const transaction = transactions.value![routeTransactionId];

		initialValues.title = transaction.title;
		initialValues.amount = Object.values(transaction.to).reduce((acc, value) => acc + value, 0) / 100;
		initialValues.from = userOptions.value.filter((userOption) => userOption.id in transaction.from);
		initialValues.to = userOptions.value.filter((userOption) => userOption.id in transaction.to);
		initialValues.date = transaction.date.toDate();
	}
});

interface UserOption {
	id: string;
	name: string;
}
const userOptions = computed<UserOption[]>(() => {
	if (!users.value) return [];

	return Object.entries(users.value).map(([userId, user]) => ({
		id: userId,
		name: user.name,
	}));
});

const initialValues = reactive<{
	title: string | null;
	amount: number | null;
	from: UserOption[];
	to: UserOption[];
	date: Date;
}>({
	title: null,
	amount: null,
	from: [],
	to: [],
	date: new Date(),
});

const formResolver = ({ values }: FormResolverOptions): Record<string, any> => {
	const errors: Record<string, any> = {};

	if (!values.title) {
		errors.title = ["Title is required."];
	}

	if (!values.amount) {
		errors.amount = ["Amount is required."];
	}

	if (values.from.length === 0) {
		errors.from = ["At least 1 person must send."];
	}

	if (values.to.length === 0) {
		errors.to = ["At least 1 person must receive."];
	}

	if (!values.date) {
		errors.date = ["Date is required."];
	}

	return {
		values,
		errors,
	};
};

async function formSubmit({ valid, values }: FormSubmitEvent): Promise<void> {
	if (valid) {
		updatingTransaction.value = true;

		const transaction: Transaction = {
			title: values.title,
			to: splitAmount(
				values.amount * 100,
				values.to.map((user: UserOption) => user.id)
			),
			from: splitAmount(
				values.amount * 100,
				values.from.map((user: UserOption) => user.id)
			),
			date: Timestamp.fromDate(values.date),
		};

		if (routeTransactionId) {
			await updateTransaction(groupId.value!, routeTransactionId!, transaction);

			toast.add({
				severity: "success",
				summary: "Transaction updated",
				life: 2000,
			});
		} else {
			await createTransaction(groupId.value!, transaction);

			toast.add({
				severity: "success",
				summary: "Transaction created",
				life: 2000,
			});
		}

		router.push(`/group/${groupId.value!}/transactions`);
		updatingTransaction.value = false;
	}
}

async function deleteTransaction(): Promise<void> {
	updatingTransaction.value = true;

	await firestoreDeleteTransaction(groupId.value!, routeTransactionId!);

	toast.add({
		severity: "success",
		summary: "Transaction deleted",
		life: 2000,
	});

	router.push(`/group/${groupId.value!}/transactions`);

	updatingTransaction.value = false;
}
</script>

<template>
	<Form
		v-slot="$form"
		:initialValues
		:resolver="formResolver"
		@submit="formSubmit"
		class="w-80 flex flex-col items-center gap-2"
	>
		<div class="flex flex-col gap-1 w-full">
			<FloatLabel variant="on">
				<InputText id="title_text" name="title" autocomplete="off" fluid />
				<label for="title_text">Title</label>
			</FloatLabel>
			<Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">
				{{ $form.title.error }}
			</Message>
		</div>

		<div class="flex flex-col gap-1 w-full">
			<FloatLabel variant="on">
				<InputNumber id="amount_number" name="amount" inputId="minmaxfraction" :min="0" :maxFractionDigits="2" fluid />
				<label for="amount_number">Amount</label>
			</FloatLabel>
			<Message v-if="$form.amount?.invalid" severity="error" size="small" variant="simple">
				{{ $form.amount.error }}
			</Message>
		</div>

		<div class="flex flex-col gap-1 w-full">
			<FloatLabel variant="on">
				<MultiSelect
					id="from_select"
					name="from"
					v-model="initialValues.from"
					:options="userOptions"
					optionLabel="name"
					class="w-full"
				/>
				<label for="from_select">From</label>
			</FloatLabel>
			<Message v-if="$form.from?.invalid" severity="error" size="small" variant="simple">
				{{ $form.from.error }}
			</Message>
		</div>

		<div class="flex flex-col gap-1 w-full">
			<FloatLabel variant="on">
				<MultiSelect
					id="to_select"
					name="to"
					v-model="initialValues.to"
					:options="userOptions"
					optionLabel="name"
					class="w-full"
				/>
				<label for="to_select">To</label>
			</FloatLabel>
			<Message v-if="$form.to?.invalid" severity="error" size="small" variant="simple">
				{{ $form.to.error }}
			</Message>
		</div>

		<div class="flex flex-col gap-1 w-full">
			<FloatLabel variant="on">
				<DatePicker id="date_date" name="date" fluid />
				<label for="date_date">Date</label>
			</FloatLabel>
			<Message v-if="$form.date?.invalid" severity="error" size="small" variant="simple">
				{{ $form.date.error }}
			</Message>
		</div>

		<Button
			type="submit"
			:icon="routeTransactionId ? 'pi pi-pencil' : 'pi pi-plus'"
			:label="routeTransactionId ? 'Update' : 'Create'"
			:loading="updatingTransaction"
			severity="secondary"
			fluid
		/>

		<Button
			v-if="routeTransactionId"
			type="button"
			icon="pi pi-trash"
			label="Delete"
			:loading="updatingTransaction"
			severity="danger"
			fluid
			@click="deleteTransaction"
		/>
	</Form>
</template>
