<script setup lang="ts">
import GoogleGLogo from "@/assets/GoogleGLogo.svg";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signIn } from "@/util/app";
</script>

<template>
	<div class="flex flex-col items-center justify-center gap-4 border border-border p-8 rounded-lg min-w-80">
		<div class="flex flex-col items-center justify-center">
			<span class="text-2xl font-bold text-center">Welcome to Setil</span>
			<span class="text-muted-foreground text-center">Sign in to start splitting expenses with friends</span>
		</div>
		<Separator />
		<Button @click="signIn()" class="w-full">
			<img :src="GoogleGLogo" class="size-5" />
			<span class="font-semibold">Continue with Google</span>
		</Button>
		<!-- Update here when version increases -->
		<span class="text-sm text-muted-foreground text-center">Setil v1.0.0 by Joel Cutler</span>
	</div>
</template>
