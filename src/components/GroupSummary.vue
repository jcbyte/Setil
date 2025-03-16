<script setup lang="ts">
import type { GroupData, GroupUserData } from "@/firebase/types";
import { formatCurrency, resolveBalance } from "@/util/util";
import { computed } from "vue";
import Avatar from "./Avatar.vue";

const props = defineProps<{
	groupData: GroupData;
	users: Record<string, GroupUserData>;
}>();

// async function inviteUser() {
// 	// Cleanup old invites
// 	await cleanupInvites(groupId.value!);

// 	// Create invite
// 	const inviteCode = await invite(groupId.value!, 24 * 60 * 60 * 1000);
// 	const inviteLink = `${window.location.origin}/invite/${groupId.value}/${inviteCode}`;
// 	const sharedData = {
// 		title: "Setil",
// 		text: "Join my Setil Group!",
// 		url: inviteLink,
// 	};

// 	// If this can be shared then share it
// 	if (navigator.canShare(sharedData)) {
// 		navigator.share(sharedData);
// 	} else {
// 		// Else copy to clipboard and display a confirmation
// 		navigator.clipboard.writeText(inviteLink).then(() => {
// 			toast.add({
// 				severity: "info",
// 				summary: "Copied invite link to Clipboard",
// 				life: 5000,
// 			});
// 		});
// 	}
// }

// todo can I make this a util function as its almost duplicated from GroupPage
const usersBalanceStr = computed<Record<string, { str: string; status: "positive" | "negative" | "neutral" }>>(() => {
	return Object.fromEntries(
		Object.entries(props.users).map(([userId, user]) => {
			const bal = resolveBalance(user.balance);
			const formattedBal = formatCurrency(Math.abs(bal), props.groupData.currency);

			let status: "positive" | "negative" | "neutral";
			let str: string;

			if (bal === 0) {
				status = "neutral";
				str = "is in balance";
			} else if (bal > 0) {
				status = "positive";
				str = `is owed ${formattedBal}`;
			} else {
				status = "negative";
				str = `owes ${formattedBal}`;
			}

			return [userId, { str, status }];
		})
	);
});
</script>

<template>
	<div class="flex flex-col gap-2 border border-zinc-800 rounded-lg p-4">
		<div class="flex flex-col">
			<span class="text-lg font-semibold">Balances</span>
			<span class="text-sm text-zinc-400">Who owes what in this group</span>
		</div>
		<div class="flex flex-col gap-1">
			<div v-for="(user, userId) in users" class="flex justify-between items-center">
				<div class="flex justify-center items-center gap-1">
					<Avatar :src="user.photoURL" :name="user.name" class="size-9" />
					<span>{{ user.name }}</span>
				</div>
				<span
					:class="`text-sm ${
						usersBalanceStr[userId].status !== 'neutral'
							? usersBalanceStr[userId].status === 'positive'
								? 'bg-green-400/20'
								: 'bg-red-400/20'
							: ''
					} rounded-full px-1.5 py-0.5 h-fit`"
					>{{ usersBalanceStr[userId].str }}</span
				>
			</div>
		</div>
	</div>
</template>
