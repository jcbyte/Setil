<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { useCurrentUser } from "@/composables/useCurrentUser";
import {
	createGroup,
	deleteGroup as firestoreDeleteGroup,
	leaveGroup as firestoreLeaveGroup,
	updateGroup,
} from "@/firebase/firestore";
import { CurrencySettings, type Currency } from "@/util/groupSettings";
import { inviteUser } from "@/util/util";
import { toTypedSchema } from "@vee-validate/zod";
import { Timestamp } from "firebase/firestore";
import { ArrowLeft, LoaderCircle, LogOut, Plus, Save, Trash, UserRoundPlus } from "lucide-vue-next";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as z from "zod";
import { useGroup } from "../composables/useGroup";

const router = useRouter();
const route = useRoute();
const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { currentUser } = useCurrentUser();
const { toast } = useToast();

const { groupId, groupData, users } = useGroup(routeGroupId, () => {
	if (!groupId.value) return;

	setValues({
		name: groupData.value!.name,
		description: groupData.value!.description ?? undefined,
		currency: groupData.value!.currency,
	});
});

interface DialogData {
	open: boolean;
	processing: boolean;
}

function openDialog(dialogData: DialogData) {
	dialogData.processing = false;
	dialogData.open = true;
}

function closeDialog(dialogData: DialogData) {
	dialogData.open = false;
}

const isGroupDetailsUpdating = ref<boolean>(false);
const isAddingMember = ref<boolean>(false);
const leaveDialogData = ref<DialogData>({ open: false, processing: false });
const deleteDialogData = ref<DialogData>({ open: false, processing: false });

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

const onSubmit = handleSubmit(async (values) => {
	if (routeGroupId) {
		if (!groupId.value) return;

		isGroupDetailsUpdating.value = true;

		await updateGroup(groupId.value, {
			name: values.name,
			description: values.description ?? null,
			currency: values.currency as Currency,
		});

		isGroupDetailsUpdating.value = false;
		toast({ title: "Group Details Updated", description: "Changes synchronised to all members.", duration: 5000 });
	} else {
		isGroupDetailsUpdating.value = true;

		const newGroupId = await createGroup({
			name: values.name,
			description: values.description ?? null,
			currency: values.currency as Currency,
			lastUpdate: Timestamp.now(),
		});

		router.push(`/group/${newGroupId}`);
		isGroupDetailsUpdating.value = false;
		toast({ title: "Group Created", description: "Time to invite your friends.", duration: 5000 });
	}
});

async function addMember() {
	if (!groupId.value) return;

	isAddingMember.value = true;
	await inviteUser(groupId.value);
	isAddingMember.value = false;
}

async function leaveGroup() {
	if (!groupId.value) return;

	leaveDialogData.value.processing = true;

	await firestoreLeaveGroup(groupId.value);

	router.push("/");
	closeDialog(leaveDialogData.value);

	toast({ title: "Group Left", description: "Your expenses here are now history.", duration: 5000 });
}

async function deleteGroup() {
	if (!groupId.value) return;

	deleteDialogData.value.processing = true;

	await firestoreDeleteGroup(groupId.value);

	router.push("/");
	closeDialog(deleteDialogData.value);

	toast({ title: "Group Deleted", description: "All data related to this group has been deleted.", duration: 5000 });
}
</script>

<template>
	<div class="w-full flex flex-col gap-4 items-center">
		<div class="w-full flex justify-between items-center">
			<div class="flex gap-2 justify-center items-center">
				<Button variant="ghost" class="size-9" @click="router.push(routeGroupId ? `/group/${routeGroupId}` : '/')">
					<ArrowLeft class="!size-6" />
				</Button>
				<span class="text-lg font-semibold">{{ routeGroupId ? "Group Settings" : "New Group" }}</span>
			</div>
			<YourAccountSettings />
		</div>

		<div class="min-w-[32rem] flex flex-col gap-4">
			<div class="border border-border rounded-lg flex flex-col gap-6 p-4">
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Group Details</span>
					<span class="text-sm text-muted-foreground">{{
						routeGroupId ? "Update your group information" : "Enter your new groups information"
					}}</span>
				</div>

				<form class="flex flex-col gap-4" @submit="onSubmit">
					<div class="flex flex-col gap-2">
						<FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
							<FormItem>
								<FormLabel>Group Name</FormLabel>
								<FormControl>
									<Input
										autocomplete="off"
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
							<FormItem>
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
							<FormItem>
								<FormLabel>Currency</FormLabel>
								<Select v-bind="componentField" :disabled="isGroupDetailsUpdating">
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Euro (€)" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem v-for="(currency, currencyId) in CurrencySettings" :value="currencyId">
											{{ currency.name }} ({{ currency.symbol }})
										</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						</FormField>
					</div>

					<Button type="submit" :disabled="isGroupDetailsUpdating" class="w-fit">
						<LoaderCircle v-if="isGroupDetailsUpdating" class="animate-spin" />
						<Save v-else-if="routeGroupId" />
						<Plus v-else />
						<span>{{ routeGroupId ? "Save Changes" : "Create Group" }}</span>
					</Button>
				</form>
			</div>

			<div v-if="routeGroupId" class="border border-border rounded-lg flex flex-col gap-6 p-4">
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Members</span>
					<span class="text-sm text-muted-foreground">View and manage group members</span>
				</div>

				<div class="flex flex-col gap-4">
					<div v-for="(user, userId) in users" class="flex justify-between items-center">
						<div class="flex justify-center items-center gap-2">
							<Avatar :src="user.photoURL" :name="user.name" class="size-9" />
							<div class="flex flex-col">
								<span>{{ user.name }}</span>
								<span class="text-sm text-muted-foreground">{{
									userId === groupData?.owner ? "Owner" : "Member"
								}}</span>
							</div>
						</div>
						<Button
							v-if="currentUser?.uid === groupData?.owner"
							variant="outline"
							:disabled="userId === groupData?.owner"
						>
							{{ userId === groupData?.owner ? "Owner" : "Remove" }}
						</Button>
					</div>
					<Button variant="outline" :disabled="isAddingMember" @click="addMember">
						<LoaderCircle v-if="isAddingMember" class="animate-spin" />
						<UserRoundPlus v-else />
						<span>Add Member</span>
					</Button>
				</div>
			</div>

			<div v-if="routeGroupId" class="border border-border rounded-lg flex flex-col gap-6 p-4">
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Danger Zone</span>
					<span class="text-sm text-muted-foreground">Dangerous action for this group</span>
				</div>

				<div class="flex flex-col gap-4">
					<div class="flex justify-between items-center">
						<div class="flex flex-col">
							<span>Leave Group</span>
							<span class="text-sm text-muted-foreground">Remove yourself from this group</span>
						</div>
						<Button variant="outline" @click="openDialog(leaveDialogData)">
							<LogOut />
							<span>Leave</span>
						</Button>
					</div>

					<Separator v-if="currentUser?.uid === groupData?.owner" />
					<div v-if="currentUser?.uid === groupData?.owner" class="flex justify-between items-center">
						<div class="flex flex-col">
							<span>Delete Group</span>
							<span class="text-sm text-muted-foreground">Permanently delete this group and all its data</span>
						</div>
						<Button variant="destructive" @click="openDialog(deleteDialogData)">
							<Trash />
							<span>Delete</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<AlertDialog v-model:open="leaveDialogData.open">
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
				<AlertDialogDescription>
					Your data will remain in the group until all debts are resolved.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<Button variant="outline" :disabled="leaveDialogData.processing" @click="closeDialog(leaveDialogData)">
					Cancel
				</Button>
				<Button :disabled="leaveDialogData.processing" @click="leaveGroup">
					<LoaderCircle v-if="leaveDialogData.processing" class="animate-spin" />
					<LogOut v-else />
					<span>Leave</span>
				</Button>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>

	<AlertDialog v-model:open="deleteDialogData.open">
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
				<AlertDialogDescription>
					This action cannot be undone. This will permanently delete the group and all its data.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<Button variant="outline" :disabled="deleteDialogData.processing" @click="closeDialog(deleteDialogData)">
					Cancel
				</Button>
				<Button variant="destructive" :disabled="deleteDialogData.processing" @click="deleteGroup">
					<LoaderCircle v-if="deleteDialogData.processing" class="animate-spin" />
					<Trash v-else />
					<span>Delete</span>
				</Button>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</template>
