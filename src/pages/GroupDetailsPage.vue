<script setup lang="ts">
import { Form, type FormResolverOptions, type FormSubmitEvent } from "@primevue/forms";
import { Button, FloatLabel, InputText, Message, Select, useToast } from "primevue";
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGroup } from "../composables/useGroup";
import { usePageTitle } from "../composables/usePageTitle";
import {
	createGroup,
	deleteGroup as firestoreDeleteGroup,
	leaveGroup as firestoreLeaveGroup,
	getUser,
	updateGroup,
} from "../firebase/firestore";
import type { GroupData } from "../firebase/types";
import { CurrencySettings, type Currency } from "../util/groupSettings";

const toast = useToast();
const router = useRouter();

const route = useRoute();
const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;

usePageTitle({ title: routeGroupId ? "Edit Group" : "Create Group" });

const creatingGroup = ref<boolean>(false);

interface CurrencyOption {
	id: Currency;
	name: string;
}
const currencyOptions = computed<CurrencyOption[]>(() =>
	Object.entries(CurrencySettings).map(([currency, currencySetting]) => ({
		id: currency as Currency,
		name: currencySetting.name,
	}))
);

const initialValues = reactive<{ name: string | null; currency: CurrencyOption | null }>({
	name: null,
	currency: null,
});

const { groupData } = useGroup(routeGroupId, () => {
	if (routeGroupId) {
		initialValues.name = groupData.value!.name;
		initialValues.currency =
			currencyOptions.value.find((currencyOption) => currencyOption.id === groupData.value!.currency) ?? null;
	}
});

const formResolver = ({ values }: FormResolverOptions): Record<string, any> => {
	const errors: Record<string, any> = {};

	if (!values.name) {
		errors.name = ["Name is required."];
	}

	if (!values.currency) {
		errors.currency = ["Currency is required."];
	}

	return {
		values,
		errors,
	};
};

async function formSubmit({ valid, values }: FormSubmitEvent): Promise<void> {
	if (valid) {
		creatingGroup.value = true;

		const groupData: Omit<GroupData, "owner"> = {
			name: values.name,
			currency: values.currency.id,
		};

		let updatedGroupId = routeGroupId;
		if (routeGroupId) {
			await updateGroup(routeGroupId, groupData);

			toast.add({
				severity: "success",
				summary: "Group updated",
				life: 2000,
			});
		} else {
			updatedGroupId = await createGroup(groupData);

			toast.add({
				severity: "success",
				summary: "Group created",
				life: 2000,
			});
		}

		router.push(`/group/${updatedGroupId}`);
		creatingGroup.value = false;
	}
}

async function leaveGroup(): Promise<void> {
	creatingGroup.value = true;

	await firestoreLeaveGroup(routeGroupId!);

	toast.add({
		severity: "success",
		summary: "Left group",
		life: 2000,
	});

	router.push(`/`);

	creatingGroup.value = false;
}

async function deleteGroup(): Promise<void> {
	creatingGroup.value = true;

	await firestoreDeleteGroup(routeGroupId!);

	toast.add({
		severity: "success",
		summary: "Group deleted",
		life: 2000,
	});

	router.push(`/`);

	creatingGroup.value = false;
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
				<InputText id="name_text" name="name" autocomplete="off" fluid />
				<label for="name_text">Group Name</label>
			</FloatLabel>
			<Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
				{{ $form.name.error }}
			</Message>
		</div>

		<div class="flex flex-col gap-1 w-full">
			<FloatLabel variant="on">
				<Select id="currency_select" name="currency" :options="currencyOptions" optionLabel="name" fluid />
				<label for="currency_select">Currency</label>
			</FloatLabel>
			<Message v-if="$form.currency?.invalid" severity="error" size="small" variant="simple">
				{{ $form.currency.error }}
			</Message>
		</div>

		<Button
			type="submit"
			:icon="routeGroupId ? 'pi pi-pencil' : 'pi pi-plus'"
			:label="routeGroupId ? 'Update' : 'Create'"
			:loading="creatingGroup"
			severity="secondary"
			fluid
		/>

		<Button
			v-if="routeGroupId"
			type="button"
			icon="pi pi-sign-out"
			label="Leave"
			:loading="creatingGroup"
			severity="danger"
			fluid
			@click="leaveGroup"
		/>

		<Button
			v-if="routeGroupId && getUser().uid === groupData?.owner"
			type="button"
			icon="pi pi-trash"
			label="Delete"
			:loading="creatingGroup"
			severity="danger"
			fluid
			@click="deleteGroup"
		/>
	</Form>
</template>
