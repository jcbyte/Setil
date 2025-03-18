<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { useCurrentUser } from "@/composables/useCurrentUser.ts";
import { firebaseSignOut } from "@/firebase/auth";
import { LogOut } from "lucide-vue-next";

const { toast } = useToast();

function signOut() {
	firebaseSignOut()
		.then(() => {
			toast({ title: "Signed Out", description: "See you again soon!", duration: 5000 });
		})
		.catch((error) => {
			toast({ title: "Error Signing Out", description: error.code, variant: "destructive", duration: 5000 });
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
				<div class="w-full flex justify-between items-center">
					<span class="text-red-400">Sign Out</span>
					<LogOut class="text-red-400 !size-5" />
				</div>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</template>
