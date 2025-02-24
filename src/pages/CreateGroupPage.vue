<script setup lang="ts">
import { Form, type FormResolverOptions, type FormSubmitEvent } from "@primevue/forms";
import { Button, FloatLabel, InputText, Message, useToast } from "primevue";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { usePageTitle } from "../composables/usePageTitle";
import { createGroup } from "../firebase/firestore";

usePageTitle("Create Group");

const creatingGroup = ref<boolean>(false);

const toast = useToast();
const router = useRouter();

const initialValues = reactive({
	name: "",
});

const formResolver = ({ values }: FormResolverOptions): Record<string, any> => {
	const errors: Record<string, any> = {};

	if (!values.name) {
		errors.name = ["Name is required."];
	}

	return {
		values,
		errors,
	};
};

async function formSubmit({ valid, values }: FormSubmitEvent): Promise<void> {
	if (valid) {
		creatingGroup.value = true;
		const newGroup = await createGroup({ name: values.name });

		toast.add({
			severity: "success",
			summary: "Group created",
			life: 2000,
		});

		router.push(`/group/${newGroup}`);
		creatingGroup.value = false;
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
				<InputText id="name_text" name="name" autocomplete="off" fluid />
				<label for="name_text">Group Name</label>
			</FloatLabel>
			<Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
				{{ $form.name.error }}
			</Message>
		</div>

		<Button type="submit" icon="pi pi-plus" label="Create" :loading="creatingGroup" severity="secondary" fluid />
	</Form>
</template>
