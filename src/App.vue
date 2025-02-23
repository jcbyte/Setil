<script setup lang="ts">
import GroupPage from "./components/GroupPage.vue";
import { auth } from "./firebase/auth";

import Button from "primevue/button";

import SignInPage from "./pages/signInPage.vue";
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
			<Button v-else @click="">
				<div class="flex items-center justify-center gap-2">
					<i class="pi pi-google" />
					<span class="font-semibold">Sign In</span>
				</div>
			</Button>
		</div>
	</div>

	<div class="flex justify-center items-center">
		<SignInPage v-if="!auth.currentUser" />
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
</template>
