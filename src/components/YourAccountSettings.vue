<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/composables/useCurrentUser.ts";
import { firebaseSignOut } from "@/firebase/auth";

function signOut() {
	firebaseSignOut()
		.then(() => {
			// todo show success toast
		})
		.catch((error) => {
			// todo show error toast
		});
}

const { currentUser } = useCurrentUser();
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Avatar
				v-bind="$attrs"
				class="size-9"
				:src="currentUser?.photoURL ?? ''"
				:name="currentUser?.displayName ?? 'Myself'"
			/>
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
</template>
