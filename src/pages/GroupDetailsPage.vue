<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import LoaderIcon from "@/components/LoaderIcon.vue";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { useControlledDialog } from "@/composables/useControlledDialog";
import { useCurrentUser } from "@/composables/useCurrentUser";
import {
	changeUserName,
	createGroup,
	deleteGroup as firestoreDeleteGroup,
	leaveGroup as firestoreLeaveGroup,
	promoteUser,
	removeUser,
	updateGroup,
} from "@/firebase/firestore";
import type { GroupUserData } from "@/firebase/types";
import { type Currency } from "@/firebase/types";
import { inviteUser } from "@/util/app";
import { CurrencySettings } from "@/util/currency";
import { getRouteParam } from "@/util/util";
import { toTypedSchema } from "@vee-validate/zod";
import { Timestamp } from "firebase/firestore";
import {
	ArrowBigUpDash,
	ArrowLeft,
	Check,
	ChevronDown,
	LogOut,
	Pencil,
	Plus,
	Save,
	Trash,
	UserRound,
	UserRoundPlus,
	X,
} from "lucide-vue-next";
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as z from "zod";
import { useGroup } from "../composables/useGroup";

const router = useRouter();
const route = useRoute();
const routeGroupId = getRouteParam(route.params.groupId);
const { currentUser } = useCurrentUser();
const { toast } = useToast();

const { groupId, groupData, users } = useGroup(routeGroupId, () => {
	if (!groupId.value) return;

	setValues({
		name: groupData.value!.name,
		description: groupData.value!.description ?? undefined,
		currency: groupData.value!.currency,
	});

	myDisplayName.value = users.value![currentUser.value!.uid].name;
});

const isGroupDetailsUpdating = ref<boolean>(false);
const isMyDisplayNameUpdating = ref<boolean>(false);
const isAddingMember = ref<boolean>(false);
const isUpdatingMember = ref<string[]>([]);

const {
	open: leaveDialogOpen,
	processing: leaveDialogProcessing,
	openDialog: openLeaveDialog,
	startDialogProcessing: startLeaveDialogProcessing,
	closeDialog: closeLeaveDialog,
} = useControlledDialog();

const {
	open: deleteDialogOpen,
	processing: deleteDialogProcessing,
	openDialog: openDeleteDialog,
	startDialogProcessing: startDeleteDialogProcessing,
	closeDialog: closeDeleteDialog,
} = useControlledDialog();

const {
	open: promoteDialogOpen,
	processing: promoteDialogProcessing,
	openDialog: openPromoteDialog,
	startDialogProcessing: startPromoteDialogProcessing,
	closeDialog: closePromoteDialog,
	data: promoteDialogData,
} = useControlledDialog<{ userId: string }>();

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

const currentGroupUser = computed<GroupUserData | null>(() => users.value?.[currentUser.value!.uid] ?? null);

const myDisplayName = ref<string | undefined>();
const myDisplayNameErrors = ref<string | undefined>();
const displayNameValidation = z.string().min(1, "Name is required").max(50, "Name cannot exceed 50 characters");

function validateMyDisplayName() {
	const parsedName = displayNameValidation.safeParse(myDisplayName.value);
	myDisplayNameErrors.value = parsedName.success ? undefined : parsedName.error.issues[0].message;
}

async function updateDisplayName() {
	if (!groupId.value) return;

	const parsedName = displayNameValidation.safeParse(myDisplayName.value);
	if (!parsedName.success) return;

	isMyDisplayNameUpdating.value = true;

	await changeUserName(groupId.value, currentUser.value!.uid, parsedName.data);

	isMyDisplayNameUpdating.value = false;

	toast({
		title: "Display Name Updated",
		description: "And just like that... a new legend is born!",
		duration: 5000,
	});
}

const memberNewName = ref<Record<string, { updating: boolean; name: string; processing: boolean; errors?: string }>>(
	{}
);

function validateMemberName(userId: string) {
	const parsedName = displayNameValidation.safeParse(memberNewName.value[userId].name);
	memberNewName.value[userId].errors = parsedName.success ? undefined : parsedName.error.issues[0].message;
}

function startRename(userId: string) {
	memberNewName.value[userId] = { updating: true, name: users.value![userId].name, processing: false };
}

function cancelRename(userId: string) {
	memberNewName.value[userId].updating = false;
}

async function acceptRename(userId: string) {
	if (!groupId.value) return;

	const parsedName = displayNameValidation.safeParse(memberNewName.value[userId].name);
	if (!parsedName.success) return;

	memberNewName.value[userId].processing = true;
	await changeUserName(groupId.value, userId, parsedName.data);
	memberNewName.value[userId].updating = false;
}

async function promoteMember() {
	if (!groupId.value) return;

	startPromoteDialogProcessing();

	await promoteUser(groupId.value, promoteDialogData.value!.userId);

	closePromoteDialog();

	toast({
		title: `${users.value![promoteDialogData.value!.userId].name} Promoted`,
		description: "Long live the new king.",
		duration: 5000,
	});
}

async function removeMember(userId: string) {
	if (!groupId.value) return;

	isUpdatingMember.value.push(userId);
	await removeUser(groupId.value, userId);
	isUpdatingMember.value.splice(isUpdatingMember.value.indexOf(userId), 1);
}

async function addMember() {
	if (!groupId.value) return;

	isAddingMember.value = true;
	await inviteUser(groupId.value, groupData.value!.name);
	isAddingMember.value = false;
}

async function leaveGroup() {
	if (!groupId.value) return;

	startLeaveDialogProcessing();

	await firestoreLeaveGroup(groupId.value);

	router.push("/");
	closeLeaveDialog();

	toast({ title: "Group Left", description: "Your expenses here are now history.", duration: 5000 });
}

async function deleteGroup() {
	if (!groupId.value) return;

	startDeleteDialogProcessing();

	await firestoreDeleteGroup(groupId.value);

	router.push("/");
	closeDeleteDialog();

	toast({ title: "Group Deleted", description: "All data related to this group has been deleted.", duration: 5000 });
}
</script>

<template>
	<div>
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

			<div class="w-full max-w-[32rem] flex flex-col gap-4">
				<div class="border border-border rounded-lg flex flex-col gap-6 p-4">
					<div class="flex flex-col">
						<span class="text-lg font-semibold">Group Details</span>
						<span class="text-sm text-muted-foreground">
							{{ routeGroupId ? "Update your group information" : "Enter your new groups information" }}
						</span>
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

						<Button type="submit" :disabled="isGroupDetailsUpdating" class="w-fit place-self-end">
							<LoaderIcon :icon="routeGroupId ? Save : Plus" :loading="isGroupDetailsUpdating" />
							<span>{{ routeGroupId ? "Save Changes" : "Create Group" }}</span>
						</Button>
					</form>
				</div>

				<div v-if="routeGroupId" class="border border-border rounded-lg flex flex-col gap-4 p-4">
					<div class="flex flex-col">
						<span class="text-lg font-semibold">Your Group Profile</span>
						<span class="text-sm text-muted-foreground">How others see you in this group</span>
					</div>
					<div v-if="currentGroupUser" class="flex items-center gap-2">
						<Avatar :src="currentGroupUser.photoURL" :name="currentGroupUser.name" class="size-9" />
						<div class="flex flex-col">
							<span>{{ currentGroupUser.name }}</span>
							<span class="text-sm text-muted-foreground">
								{{ currentUser?.uid === groupData?.owner ? "Owner" : "Member" }}
							</span>
						</div>
					</div>
					<Skeleton v-else class="w-56 h-10" />
					<div class="flex flex-col gap-2">
						<span :class="`text-sm font-[500] ${myDisplayNameErrors && 'text-destructive'}`">Display Name</span>
						<div class="flex justify-center items-center gap-2">
							<div class="relative w-full">
								<Input
									v-model:model-value="myDisplayName"
									class="pl-8"
									autocomplete="off"
									type="text"
									placeholder="Name"
									:disabled="isMyDisplayNameUpdating"
									@update:model-value="validateMyDisplayName"
								/>
								<span class="absolute left-0 inset-y-0 flex items-center justify-center px-2 text-muted-foreground">
									<UserRound class="size-4" />
								</span>
							</div>
							<Button type="button" :disabled="isMyDisplayNameUpdating" class="w-fit" @click="updateDisplayName">
								<LoaderIcon :icon="Check" :loading="isMyDisplayNameUpdating" />
								<span>Update</span>
							</Button>
						</div>
						<span v-if="myDisplayNameErrors" class="text-[12.8px] text-destructive">{{ myDisplayNameErrors }}</span>
					</div>
				</div>

				<div v-if="routeGroupId" class="border border-border rounded-lg flex flex-col gap-6 p-4">
					<div class="flex flex-col">
						<span class="text-lg font-semibold">Members</span>
						<span class="text-sm text-muted-foreground">View and manage group members</span>
					</div>

					<div class="flex flex-col gap-4">
						<div
							v-if="users"
							v-for="(user, userId) in Object.fromEntries(
							Object.entries(users).filter(([, user]) => user.status !== 'history')
						) as Record<string, GroupUserData>"
							class="flex flex-col gap-2"
						>
							<div class="flex justify-between items-center gap-2">
								<div class="flex items-center gap-2 flex-1">
									<Avatar
										:src="user.photoURL"
										:name="user.name"
										:class="`size-9 ${user.status === 'left' && 'opacity-70'}`"
									/>
									<div v-if="!(memberNewName[userId]?.updating ?? false)" class="flex flex-col">
										<span :class="`${user.status === 'left' && 'text-muted-foreground'}`">{{ user.name }}</span>
										<span :class="`text-sm text-muted-foreground ${user.status !== 'active' && 'italic'}`">
											{{ user.status === "active" ? (userId === groupData?.owner ? "Owner" : "Member") : "Left Group" }}
										</span>
									</div>
									<div v-else class="flex-1 flex gap-2">
										<Input
											v-model:model-value="memberNewName[userId].name"
											autocomplete="off"
											type="text"
											placeholder="Name"
											:disabled="memberNewName[userId].processing"
											@update:model-value="validateMemberName(userId)"
										/>
										<Button class="size-9" @click="acceptRename(userId)" :disabled="memberNewName[userId].processing">
											<LoaderIcon :icon="Check" :loading="memberNewName[userId].processing" />
										</Button>
										<Button
											variant="outline"
											class="size-9"
											@click="cancelRename(userId)"
											:disabled="memberNewName[userId].processing"
										>
											<X />
										</Button>
									</div>
								</div>
								<DropdownMenu
									v-if="currentUser?.uid === groupData?.owner && !(memberNewName[userId]?.updating ?? false)"
								>
									<DropdownMenuTrigger as-child>
										<Button
											variant="outline"
											:disabled="
												userId === groupData?.owner || user.status !== 'active' || isUpdatingMember.includes(userId)
											"
										>
											<LoaderIcon
												v-if="user.status === 'active' && userId !== groupData?.owner"
												:icon="ChevronDown"
												:loading="isUpdatingMember.includes(userId)"
											/>
											<span>
												{{ user.status === "active" ? (userId === groupData?.owner ? "Owner" : "Actions") : "Left" }}
											</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem @click="startRename(userId)">
											<div class="w-full flex justify-between items-center">
												<span>Rename</span>
												<Pencil class="!size-5" />
											</div>
										</DropdownMenuItem>
										<DropdownMenuItem @click="openPromoteDialog({ userId })">
											<div class="w-full flex justify-between items-center">
												<span>Promote</span>
												<ArrowBigUpDash class="!size-5" />
											</div>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem @click="removeMember(userId)">
											<div class="w-full flex justify-between items-center">
												<span class="text-red-400">Remove</span>
												<Trash class="text-red-400 !size-5" />
											</div>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<span v-if="memberNewName[userId]?.errors ?? false" class="text-[12.8px] ml-11 text-destructive">
								{{ memberNewName[userId].errors }}
							</span>
						</div>

						<Button variant="outline" :disabled="isAddingMember" @click="addMember">
							<LoaderIcon :icon="UserRoundPlus" :loading="isAddingMember" />
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
						<div class="flex justify-between items-center gap-2">
							<div class="flex flex-col">
								<span>Leave Group</span>
								<span class="text-sm text-muted-foreground">Remove yourself from this group</span>
							</div>
							<Button variant="outline" @click="openLeaveDialog">
								<LogOut />
								<span>Leave</span>
							</Button>
						</div>

						<Separator v-if="currentUser?.uid === groupData?.owner" />
						<div v-if="currentUser?.uid === groupData?.owner" class="flex justify-between items-center gap-2">
							<div class="flex flex-col">
								<span>Delete Group</span>
								<span class="text-sm text-muted-foreground">Permanently delete this group and all its data</span>
							</div>
							<Button variant="destructive" @click="openDeleteDialog">
								<Trash />
								<span>Delete</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<AlertDialog v-model:open="promoteDialogOpen">
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						Promoting
						<span class="font-semibold">
							{{ users![promoteDialogData!.userId].name }}
						</span>
						to Owner will change your role to Member.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter class="gap-2">
					<Button variant="outline" :disabled="promoteDialogProcessing" @click="closePromoteDialog">Cancel</Button>
					<Button :disabled="promoteDialogProcessing" @click="promoteMember">
						<LoaderIcon :icon="ArrowBigUpDash" :loading="promoteDialogProcessing" />
						<span>Promote</span>
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>

		<AlertDialog v-model:open="leaveDialogOpen">
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						Your data will remain in the group until all debts are resolved.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter class="gap-2">
					<Button variant="outline" :disabled="leaveDialogProcessing" @click="closeLeaveDialog">Cancel</Button>
					<Button :disabled="leaveDialogProcessing" @click="leaveGroup">
						<LoaderIcon :icon="LogOut" :loading="leaveDialogProcessing" />
						<span>Leave</span>
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>

		<AlertDialog v-model:open="deleteDialogOpen">
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the group and all its data.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter class="gap-2">
					<Button variant="outline" :disabled="deleteDialogProcessing" @click="closeDeleteDialog">Cancel</Button>
					<Button variant="destructive" :disabled="deleteDialogProcessing" @click="deleteGroup">
						<LoaderIcon :icon="Trash" :loading="deleteDialogProcessing" />
						<span>Delete</span>
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	</div>
</template>
