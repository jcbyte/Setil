<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
	<div class="flex flex-col items-center justify-center gap-4 border border-border p-8 rounded-lg min-w-80">
		<div class="flex flex-col items-center justify-center">
			<span class="text-2xl font-bold">Error 404</span>
			<span class="text-muted-foreground">This Page cannot be found</span>
		</div>
		<Separator />
		<Button @click="router.push('/')" class="w-full">
			<span class="font-semibold">Return Home</span>
		</Button>
	</div>
</template>
