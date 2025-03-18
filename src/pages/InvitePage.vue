<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { joinGroup } from "../firebase/firestore";

const route = useRoute();
const router = useRouter();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const routeInviteCode = Array.isArray(route.params.inviteCode)
	? route.params.inviteCode[0]
	: route.params.inviteCode || null;

onMounted(async () => {
	function errorHome() {
		// todo show error toast

		router.push(`/`);
	}

	if (!routeGroupId || !routeInviteCode) {
		errorHome();
		return;
	}

	const joined = await joinGroup(routeGroupId, routeInviteCode);
	if (joined) {
		// todo show success toast

		router.push(`/group/${routeGroupId}`);
	} else {
		errorHome();
		return;
	}
});
</script>

<template>
	<div class="flex flex-col justify-center items-center gap-2">
		<i class="pi pi-spinner pi-spin" style="font-size: 4rem; color: var(--p-primary-color)" />
		<span>Joining Group</span>
	</div>
</template>
