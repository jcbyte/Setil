<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import {
	deleteGroup as firestoreDeleteGroup,
	leaveGroup as firestoreLeaveGroup,
	updateGroup,
} from "@/firebase/firestore";
import { CurrencySettings, type Currency } from "@/util/groupSettings";
import { inviteUser } from "@/util/util";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as z from "zod";
import { useGroup } from "../composables/useGroup";

const router = useRouter();
const route = useRoute();
const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;

const isGroupDetailsUpdating = ref<boolean>(false);
const isAddingMember = ref<boolean>(false);
const isLeavingGroup = ref<boolean>(false);
const isDeletingGroup = ref<boolean>(false);

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

const { groupId, groupData, users } = useGroup(routeGroupId, () => {
	if (!groupId) return;

	setValues({
		name: groupData.value!.name,
		description: groupData.value!.description ?? undefined,
		currency: groupData.value!.currency,
	});
});
const onSubmit = handleSubmit(async (values) => {
	if (!groupId.value) return;

	isGroupDetailsUpdating.value = true;
	await updateGroup(groupId.value, {
		name: values.name,
		description: values.description ?? null,
		currency: values.currency as Currency,
	});
	isGroupDetailsUpdating.value = false;
});

async function addMember() {
	if (!groupId.value) return;

	isAddingMember.value = true;
	await inviteUser(groupId.value);
	isAddingMember.value = false;
}

async function leaveGroup() {
	if (!groupId.value) return;

	isLeavingGroup.value = true;
	await firestoreLeaveGroup(groupId.value);
	isLeavingGroup.value = false;
}

async function deleteGroup() {
	if (!groupId.value) return;

	isDeletingGroup.value = true;
	await firestoreDeleteGroup(groupId.value);
	isDeletingGroup.value = false;
}

// todo remove users
// todo disable certain buttons for non-owner
// todo confirm leave/delete group
// todo new group page
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

		<div class="min-w-[32rem] flex flex-col gap-4">
			<div class="border border-zinc-800 rounded-lg flex flex-col gap-6 p-4">
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Group Details</span>
					<span class="text-sm text-zinc-400">Update your group information</span>
				</div>

				<form class="flex flex-col gap-4" @submit="onSubmit">
					<div class="flex flex-col gap-2">
						<FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
							<FormItem v-auto-animate>
								<FormLabel>Group Name</FormLabel>
								<FormControl>
									<Input
										type="text"
										placeholder="Germany Trip"
										:disabled="isGroupDetailsUpdating"
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
										:disabled="isGroupDetailsUpdating"
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
									<Select v-bind="componentField" :disabled="isGroupDetailsUpdating">
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

					<Button type="submit" :disabled="isGroupDetailsUpdating" class="w-fit">
						<i :class="`pi ${isGroupDetailsUpdating ? 'pi-spin pi-spinner' : 'pi-save'}`" />
						<span>Save Changes</span>
					</Button>
				</form>
			</div>

			<div class="border border-zinc-800 rounded-lg flex flex-col gap-6 p-4">
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Members</span>
					<span class="text-sm text-zinc-400">View and manage group members</span>
				</div>

				<div class="flex flex-col gap-4">
					<div v-for="(user, userId) in users" class="flex justify-between items-center">
						<div class="flex justify-center items-center gap-2">
							<Avatar :src="user.photoURL" :name="user.name" class="size-9" />
							<div class="flex flex-col">
								<span>{{ user.name }}</span>
								<span class="text-sm text-zinc-400">{{ userId === groupData!.owner ? "Owner" : "Member" }}</span>
							</div>
						</div>
						<Button variant="outline" :disabled="userId === groupData!.owner">
							{{ userId === groupData!.owner ? "Owner" : "Remove" }}
						</Button>
					</div>
					<Button variant="outline" :disabled="isAddingMember" @click="addMember">
						<i :class="`pi ${isAddingMember ? 'pi pi-spin pi-spinner' : 'pi-user-plus'}`" />
						<span>Add Member</span>
					</Button>
				</div>
			</div>

			<div class="border border-zinc-800 rounded-lg flex flex-col gap-6 p-4">
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Danger Zone</span>
					<span class="text-sm text-zinc-400">Dangerous action for this group</span>
				</div>

				<div class="flex flex-col gap-4">
					<div class="flex justify-between items-center">
						<div class="flex flex-col">
							<span>Leave Group</span>
							<span class="text-sm text-zinc-400">Remove yourself from this group</span>
						</div>
						<Button variant="outline" @click="leaveGroup">
							<i class="pi pi-sign-out" />
							<span>Leave</span>
						</Button>
					</div>

					<Separator />

					<div class="flex justify-between items-center">
						<div class="flex flex-col">
							<span>Delete Group</span>
							<span class="text-sm text-zinc-400">Remove yourself from this group</span>
						</div>
						<Button variant="destructive" @click="deleteGroup">
							<i class="pi pi-trash" />
							<span>Delete</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
