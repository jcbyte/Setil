<script setup lang="ts">
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AvatarProp } from "./Avatar.vue";
import CustomAvatar from "./Avatar.vue";

defineProps<{
	avatars: AvatarProp[];
	totalCount?: number | null;
	avatarClass?: any;
}>();
</script>

<template>
	<div class="flex -space-x-4">
		<CustomAvatar :class="avatarClass" v-for="avatar in avatars" :src="avatar.src" :name="avatar.name" />
		<Avatar :class="avatarClass" v-if="totalCount && totalCount > avatars.length">
			<AvatarFallback>+{{ totalCount - avatars.length }}</AvatarFallback>
		</Avatar>
	</div>
</template>
