<script setup lang="ts">
import { getAuth } from "firebase/auth";
import { Button, Toast, useToast, type ToastMessageOptions } from "primevue";
import { onMounted, ref } from "vue";
import { firebaseSignOut, signInWithGoogle } from "./firebase/auth";
import SignInPage from "./pages/signInPage.vue";

const toast = useToast();

const currentUser = ref(getAuth().currentUser);
onMounted(() => {
	getAuth().onAuthStateChanged((user) => {
		console.log("AAA");
		currentUser.value = user;
	});
});

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

function signOut() {
	firebaseSignOut()
		.then(() => {
			toast.add({
				severity: "success",
				summary: "Signed Out",
				detail: "You have been signed out",
				life: 3000,
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
	<div class="relative w-full bg-zinc-800 flex items-center justify-between py-2 px-4">
		<div>
			<span class="text-lg font-bold">Setil</span>
		</div>

		<div class="absolute left-1/2 transform -translate-x-1/2">
			<span>Page Title</span>
		</div>

		<div>
			<div v-if="currentUser" class="flex items-center gap-2">
				<img
					class="rounded-full object-cover aspect-square size-8"
					:title="currentUser.displayName ?? ''"
					:src="currentUser.photoURL ?? ''"
				/>
				<div class="flex items-center justify-center bg-zinc-700 size-8 rounded-full" @click="signOut()">
					<i class="pi pi-sign-out text-zinc-300" style="font-size: 1rem" />
				</div>
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
		<SignInPage v-if="!currentUser" :signIn="signIn" />
		<router-view v-else />
	</div>

	<Toast position="top-center" />
</template>
