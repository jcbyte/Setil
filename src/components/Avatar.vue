<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

defineProps<{
	src: string | null;
	name: string;
}>();
</script>

<template>
	<Avatar v-bind="$attrs">
		<AvatarImage :src="src ?? ''" :alt="name" />
		<AvatarFallback>{{ name.substring(0, 2) }}</AvatarFallback>
	</Avatar>
</template>
