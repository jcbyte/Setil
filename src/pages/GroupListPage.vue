<script setup lang="ts">
import GroupListItem from "@/components/GroupListItem.vue";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { firebaseSignOut } from "@/firebase/auth";
import { getUser, getUserGroups } from "@/firebase/firestore";
import type { GroupData } from "@/firebase/types";
import { useToast } from "primevue";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const groups = ref<Record<string, GroupData> | null>(null);

const user = computed(() => getUser());

const toast = useToast();

onMounted(() => {
	getUserGroups().then((groupsList) => {
		groups.value = groupsList;
	});
});

function signOut() {
	firebaseSignOut()
		.then(() => {
			toast.add({
				severity: "success",
				summary: "Signed Out",
				life: 2000,
			});
		})
		.catch((error) => {
			toast.add({
				severity: "error",
				summary: "Sign Out Failed",
				detail: error.message,
				life: 5000,
			});
		});
}

// todo implement skeleton whilst loading
</script>

<template>
	<div class="w-full flex flex-col gap-4">
		<div class="flex justify-between">
			<span class="text-lg font-semibold">My Groups</span>
			<div class="flex gap-2 justify-center items-center">
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Avatar class="size-9">
							<AvatarImage :src="user.photoURL ?? ''" :alt="user.displayName" />
							<AvatarFallback>{{ user.displayName?.substring(0, 2) }}</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem @click="signOut">
							<div class="w-full flex justify-between">
								<span class="text-red-400">Sign Out</span>
								<i class="pi pi-sign-out text-red-400" />
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<Button @click="router.push('/create')">
					<i class="pi pi-plus-circle font-semibold" />
					<span class="font-semibold">New Group</span>
				</Button>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<GroupListItem v-for="(group, groupId) in groups" :group="group" @click="router.push(`/group/${groupId}`)" />
		</div>
	</div>
</template>
