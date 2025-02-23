<script setup lang="ts">
import { Button } from "primevue";
import { signInWithGoogle } from "../firebase/auth";
</script>

<template>
	<div class="flex flex-col items-center justify-center p-6 gap-4">
		<h1 class="text-2xl font-bold">You Must Sign In to Use This App</h1>
		<Button @click="signInWithGoogle()">
			<div class="flex items-center justify-center gap-2">
				<i class="pi pi-google" />
				<span class="font-semibold">Sign In with Google</span>
			</div>
		</Button>
	</div>
</template>
