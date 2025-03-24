<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/composables/useCurrentUser.ts";
import { signOut } from "@/util/app";
import { LogOut } from "lucide-vue-next";

const { currentUser } = useCurrentUser();
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Avatar
				v-bind="$attrs"
				class="size-9"
				:src="currentUser?.photoURL ?? ''"
				:name="currentUser?.displayName ?? 'Me'"
			/>
		</DropdownMenuTrigger>
		<DropdownMenuContent>
			<DropdownMenuItem @click="signOut">
				<div class="w-full flex justify-between items-center">
					<span class="text-red-400">Sign Out</span>
					<LogOut class="text-red-400 !size-5" />
				</div>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</template>
