<script setup lang="ts">
import { getAuth } from "firebase/auth";
import { Button, Skeleton, Toast, useToast, type ToastMessageOptions } from "primevue";
import { onMounted, ref } from "vue";
import { usePageTitle } from "./composables/usePageTitle";
import { firebaseSignOut, signInWithGoogle } from "./firebase/auth";
import SignInPage from "./pages/SignInPage.vue";

import { useColorMode } from "@vueuse/core";

const toast = useToast();

const { pageTitle } = usePageTitle();

const firebaseLoaded = ref(false);
const currentUser = ref(getAuth().currentUser);

onMounted(() => {
	getAuth().onAuthStateChanged((user) => {
		firebaseLoaded.value = true;
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
				life: 2000,
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

useColorMode().value = "dark";
</script>

<template>
	<!-- <div class="relative w-full bg-zinc-800 flex items-center justify-between py-2 px-4">
		<router-link to="/">
			<span class="text-lg font-bold">Setil</span>
		</router-link>

		<div class="absolute left-1/2 transform -translate-x-1/2">
			<span v-if="pageTitle.title">{{ pageTitle.title }}</span>
			<Skeleton v-else class="!w-32 !h-8" />
		</div>

		<div v-if="firebaseLoaded">
			<div v-if="currentUser" class="flex items-center gap-2">
				<img
					class="rounded-lg object-cover aspect-square size-8"
					:title="currentUser.displayName ?? ''"
					:src="currentUser.photoURL ?? ''"
				/>
				<div
					class="flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 duration-300 cursor-pointer size-8 rounded-lg"
					@click="signOut()"
				>
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
		<Skeleton v-else class="!w-32 !h-8" />
	</div> -->

	<div v-if="firebaseLoaded" class="flex justify-center items-center p-4">
		<SignInPage v-if="!currentUser" :signIn="signIn" />
		<router-view v-else />
	</div>
	<div v-else class="flex justify-center w-full p-4">
		<Skeleton class="!w-9/12 !h-80" />
	</div>

	<Toast position="top-center" />
</template>
