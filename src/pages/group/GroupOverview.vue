<script setup lang="ts">
import { Button, useToast } from "primevue";
import { useRoute } from "vue-router";
import { useGroup } from "../../composables/useGroup";
import { invite } from "../../firebase/firestore";
import { type GroupUserData } from "../../firebase/types";
import { formatCurrency } from "../../util/util";

const route = useRoute();
const toast = useToast();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupId, groupData, users } = useGroup(routeGroupId);

function calculateBalance(balance: GroupUserData["balance"]): number {
	return Object.values(balance).reduce((acc, value) => acc + value, 0);
}

async function inviteUser() {
	const inviteCode = await invite(groupId.value!, 24 * 60 * 60 * 1000);
	const inviteLink = `${window.location.origin}/invite/${groupId.value}/${inviteCode}`;
	const sharedData = {
		title: "Setil",
		text: "Join my Setil Group!",
		url: inviteLink,
	};

	// If this can be shared then share it
	if (navigator.canShare(sharedData)) {
		navigator.share(sharedData);
	} else {
		// Else copy to clipboard and display a confirmation
		navigator.clipboard.writeText(inviteLink).then(() => {
			toast.add({
				severity: "info",
				summary: "Copied invite link to Clipboard",
				life: 5000,
			});
		});
	}
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="bg-zinc-700 w-80 rounded-lg p-2 flex justify-between" v-for="user in users">
			<div class="text-lg">{{ user.name }}</div>
			<div class="text-lg">
				{{ formatCurrency(calculateBalance(user.balance) / 100, groupData!.currency) }}
			</div>
		</div>
	</div>

	<div>
		<router-link :to="`/group/${groupId}/settle`">
			<Button label="Settle Up" />
		</router-link>
	</div>

	<div>
		<Button label="Invite" @click="inviteUser" />
	</div>
</template>
