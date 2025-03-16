<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { firebaseSignOut } from "@/firebase/auth";
import { getUser } from "@/firebase/firestore";
import { useToast } from "primevue";

const toast = useToast();

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

const user = getUser();
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Avatar v-bind="$attrs" class="size-9" :src="user.photoURL" :name="user.displayName ?? 'Myself'" />
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
