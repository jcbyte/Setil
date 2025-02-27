<script setup lang="ts">
import { Form, type FormResolverOptions, type FormSubmitEvent } from "@primevue/forms";
import { Timestamp } from "firebase/firestore";
import { Button, DatePicker, FloatLabel, InputNumber, InputText, Message, MultiSelect, useToast } from "primevue";
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { createTransaction, type GroupUserData, type WithId } from "../firebase/firestore";
import { useGroupStore } from "../stores/useGroupStore";
import { splitAmount } from "../util/util";

const router = useRouter();
const toast = useToast();
const groupStore = useGroupStore();

const addingTransaction = ref<boolean>(false);

onMounted(() => {
	if (!groupStore.groupId) {
		toast.add({
			severity: "error",
			summary: "No Group Selected",
			life: 2000,
		});

		router.push("/");
	}
});

const initialValues = reactive({
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

	return {
		values,
		errors,
	};
};

async function formSubmit({ valid, values }: FormSubmitEvent): Promise<void> {
	if (valid) {
		addingTransaction.value = true;

		await createTransaction(groupStore.groupId!, {
			title: values.title,
			to: splitAmount(
				values.amount,
				values.to.map((user: WithId<GroupUserData>) => user.id)
			),
			from: splitAmount(
				values.amount,
				values.from.map((user: WithId<GroupUserData>) => user.id)
			),
			date: Timestamp.fromDate(values.date),
		});

		toast.add({
			severity: "success",
			summary: "Transaction created",
			life: 2000,
		});

		router.push(`/group/${groupStore.groupId!}`);
		addingTransaction.value = false;
	}
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
					:options="groupStore.users!"
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
					:options="groupStore.users!"
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

		<Button type="submit" icon="pi pi-plus" label="Create" :loading="addingTransaction" severity="secondary" fluid />
	</Form>
</template>
