<script setup lang="ts">
import { Button } from "primevue";

defineProps<{
	signIn: () => void;
}>();
</script>

<template>
	<div class="flex flex-col items-center justify-center p-8 gap-4">
		<h1 class="text-2xl font-semibold">You Must Sign In to Use This App</h1>
		<Button @click="signIn()">
			<div class="flex items-center justify-center gap-2">
				<i class="pi pi-google" />
				<span class="font-semibold">Sign In with Google</span>
			</div>
		</Button>
	</div>
</template>
