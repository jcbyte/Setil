<script setup lang="ts">
import type { GroupUserData } from "../firebase/firestore";

defineProps<{
	users: GroupUserData[];
}>();

function calculateBalance(balance: GroupUserData["balance"]): number {
	return Object.values(balance).reduce((acc, value) => acc + value, 0);
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="bg-zinc-700 w-80 rounded-lg p-2 flex justify-between" v-for="user in users">
			<div class="text-lg">{{ user.name }}</div>
			<div class="text-lg">{{ calculateBalance(user.balance) }}</div>
		</div>
	</div>
</template>
