<script setup lang="ts">
import GroupPage from "./components/GroupPage.vue";
</script>

<template>
	<div class="flex justify-center items-center">
		<GroupPage
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
