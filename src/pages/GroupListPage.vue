<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getUser, getUserGroups } from "../firebase/firestore";
import { type GroupData } from "../firebase/types";
import GroupListItem from "./groupList/GroupListItem.vue";

const router = useRouter();

const groups = ref<Record<string, GroupData> | null>(null);

const user = computed(() => getUser());

onMounted(() => {
	getUserGroups().then((groupsList) => {
		groups.value = groupsList;
	});
});
</script>

<template>
	<!-- <div class="flex flex-col items-center gap-4">
		<div v-if="groups" class="flex flex-col w-80 gap-2">
			<div
				class="bg-zinc-700 hover:bg-zinc-600 duration-300 cursor-pointer w-full rounded-lg p-2"
				v-for="(group, groupId) in groups"
			>
				<router-link :to="`/group/${groupId}`" class="flex justify-between items-center">
					<span class="text-lg">{{ group.name }}</span>
					<i class="pi pi-chevron-right" />
				</router-link>
			</div>
		</div>
		<div v-else class="flex flex-col w-80 gap-2">
			<Skeleton class="!w-full !h-11 !rounded-lg" />
			<Skeleton class="!w-full !h-11 !rounded-lg" />
			<Skeleton class="!w-full !h-11 !rounded-lg" />
		</div>

		<router-link to="/create" class="w-full">
			<Button severity="secondary" icon="pi pi-plus" label="New" fluid />
		</router-link>
	</div> -->
	<div class="w-full flex flex-col gap-4">
		<div class="flex justify-between">
			<span class="text-lg font-semibold">My Groups</span>
			<div class="flex gap-2 justify-center items-center">
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Avatar>
							<AvatarImage :src="user.photoURL ?? ''" :alt="user.displayName" />
							<AvatarFallback>{{ user.displayName?.substring(0, 2) }}</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem @click="console.log(2)">
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
