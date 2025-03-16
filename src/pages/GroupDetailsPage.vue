<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { CurrencySettings, type Currency } from "@/util/groupSettings";
import { useRoute, useRouter } from "vue-router";
import { useGroup } from "../composables/useGroup";

import { updateGroup } from "@/firebase/firestore";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import * as z from "zod";

const router = useRouter();
const route = useRoute();
const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;

const groupDetailsUpdating = ref<boolean>(false);

const formSchema = toTypedSchema(
	z.object({
		name: z.string().min(1, "Group name is required").max(50, "Group name cannot exceed 50 characters"),
		description: z.string().optional(),
		currency: z.string().refine((val) => Object.keys(CurrencySettings).includes(val), "Must select a valid currency"),
	})
);

const { isFieldDirty, handleSubmit, setValues } = useForm({
	validationSchema: formSchema,
});

const { groupId, groupData } = useGroup(routeGroupId, () => {
	if (!groupId) return;

	setValues({
		name: groupData.value!.name,
		description: groupData.value!.description ?? undefined,
		currency: groupData.value!.currency,
	});
});
const onSubmit = handleSubmit(async (values) => {
	if (!groupId.value) return;

	groupDetailsUpdating.value = true;

	await updateGroup(groupId.value, {
		name: values.name,
		description: values.description ?? null,
		currency: values.currency as Currency,
	});

	groupDetailsUpdating.value = false;
});
</script>

<template>
	<div class="w-full flex flex-col gap-4 items-center">
		<div class="w-full flex justify-between items-center">
			<div class="flex gap-2 justify-center items-center">
				<Button variant="ghost" class="size-9" @click="router.push(`/group/${routeGroupId}`)">
					<i class="pi pi-arrow-left" />
				</Button>
				<span v-if="groupId" class="text-lg font-semibold">Group Settings</span>
				<Skeleton v-else class="w-20 h-7" />
			</div>
			<YourAccountSettings />
		</div>

		<div class="min-w-96 flex flex-col gap-4">
			<div class="border border-zinc-800 rounded-lg flex flex-col gap-4 p-4">
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Group Details</span>
					<span class="text-sm text-zinc-400">Update your group information</span>
				</div>

				<form class="flex flex-col gap-6" @submit="onSubmit">
					<div class="flex flex-col gap-2">
						<FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
							<FormItem v-auto-animate>
								<FormLabel>Group Name</FormLabel>
								<FormControl>
									<Input
										type="text"
										placeholder="Germany Trip"
										:disabled="groupDetailsUpdating"
										v-bind="componentField"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<FormField v-slot="{ componentField }" name="description" :validate-on-blur="!isFieldDirty">
							<FormItem v-auto-animate>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Expenses for Munich Trip."
										:disabled="groupDetailsUpdating"
										v-bind="componentField"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<FormField v-slot="{ componentField }" name="currency" :validate-on-blur="!isFieldDirty">
							<FormItem v-auto-animate>
								<FormLabel>Currency</FormLabel>
								<FormControl>
									<Select v-bind="componentField" :disabled="groupDetailsUpdating">
										<SelectTrigger>
											<SelectValue placeholder="Euro (€)" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem v-for="(currency, currencyId) in CurrencySettings" :value="currencyId">
												{{ currency.name }} ({{ currency.symbol }})
											</SelectItem>
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>
					</div>

					<Button type="submit" :disabled="groupDetailsUpdating" class="w-fit">
						<i :class="`pi ${groupDetailsUpdating ? 'pi-spin pi-spinner' : 'pi-save'}`" />
						<span>Save Changes</span>
					</Button>
				</form>
			</div>

			<div class="border border-zinc-800 rounded-lg flex flex-col gap-4 p-4">next section</div>
		</div>
	</div>
</template>
