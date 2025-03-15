<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

defineProps<{
	signIn: () => void;
}>();
</script>

<template>
	<div class="flex flex-col items-center justify-center gap-4 border border-zinc-800 bg-zinc-950 p-8 rounded-lg">
		<div class="flex flex-col items-center justify-center">
			<span class="text-2xl font-bold">Welcome to Setil</span>
			<span class="text-zinc-400">Sign in to start splitting expenses with friends</span>
		</div>
		<Separator />
		<Button @click="signIn()" class="w-96">
			<i class="pi pi-google" />
			<span class="font-semibold">Continue with Google</span>
		</Button>
		<!-- Update here when version increases -->
		<span class="text-sm text-zinc-400">Setil v0.1.0 by Joel Cutler</span>
	</div>
</template>
