<script setup lang="ts">
import { Button, Toast, useToast, type ToastMessageOptions } from "primevue";
import GroupPage from "./components/GroupPage.vue";
import { auth, signInWithGoogle } from "./firebase/auth";
import SignInPage from "./pages/signInPage.vue";

const toast = useToast();

function signIn() {
	const persistentMessage: ToastMessageOptions = {
		summary: "Signing In",
		detail: "Continue in the popup window",
		closable: false,
	};

	toast.add(persistentMessage);
	signInWithGoogle()
		.then(() => {
			toast.remove(persistentMessage);
			toast.add({
				severity: "success",
				summary: "Signed In",
				detail: "You are now signed in",
				life: 3000,
			});
		})
		.catch((error) => {
			toast.remove(persistentMessage);
			toast.add({
				severity: "error",
				summary: "Sign In Failed",
				detail: error.message,
				life: 5000,
			});
		});
}
</script>

<template>
	<div class="relative w-full bg-zinc-800 flex items-center justify-between py-2 px-4">
		<div>
			<span class="text-lg font-bold">Setil</span>
		</div>

		<div class="absolute left-1/2 transform -translate-x-1/2">
			<span>Page Title</span>
		</div>

		<div>
			<div v-if="auth.currentUser">
				<div>Account icon</div>
				<div>Settings</div>
			</div>
			<Button v-else @click="signIn()">
				<div class="flex items-center justify-center gap-2">
					<i class="pi pi-google" />
					<span class="font-semibold">Sign In</span>
				</div>
			</Button>
		</div>
	</div>

	<div class="flex justify-center items-center">
		<SignInPage v-if="!auth.currentUser" :signIn="signIn" />
		<GroupPage
			v-else
			:group="{
				name: 'group',
				owner: 'owner',
				users: [{ id: 'owner', name: 'OWNER' }],
				transactions: [
					{ title: 'title', amount: 0, from: ['aa', 'bb'], to: ['cc'], date: new Date() },
					{ title: 'title2', amount: 1000, from: ['aa'], to: ['bb', 'cc'], date: new Date() },
				],
			}"
		/>
	</div>

	<Toast position="top-center" />
</template>
