<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import GroupListItem from "@/components/GroupListItem.vue";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { firebaseSignOut } from "@/firebase/auth";
import { getUser, getUserGroups, type ExtendedGroupData } from "@/firebase/firestore";
import { useToast } from "primevue";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const groups = ref<Record<string, ExtendedGroupData> | null>(null);

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
</script>

<template>
	<div class="w-full flex flex-col gap-4">
		<div class="flex justify-between">
			<span class="text-lg font-semibold">My Groups</span>
			<div class="flex gap-2 justify-center items-center">
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Avatar class="size-9" :src="user.photoURL" :name="user.displayName ?? 'Myself'" />
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
			<GroupListItem
				v-if="groups"
				v-for="(group, groupId) in groups"
				:group="group"
				@click="router.push(`/group/${groupId}`)"
			/>
			<Skeleton v-else v-for="_n in 3" class="rounded-lg h-[158px]" />
		</div>
	</div>
</template>
