<script setup lang="ts">
import type { GroupUserData } from "../firebase/firestore";

defineProps<{
	users: GroupUserData[];
}>();
</script>

<template>
	<div class="bg-zinc-700 w-80 rounded-lg p-2 flex flex-col" v-for="user in users">
		<div class="text-lg">{{ user.name }}</div>
		<div class="text-lg">{{ user.balance }}</div>
	</div>
</template>
