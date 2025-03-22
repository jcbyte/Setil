<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import BalanceStrBadge from "@/components/BalanceStrBadge.vue";
import { Button } from "@/components/ui/button";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { useGroup } from "@/composables/useGroup";
import { getBalanceStr, type BalanceStr } from "@/util/currency";
import { ArrowLeft, ArrowRight } from "lucide-vue-next";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupId, groupData, users } = useGroup(routeGroupId);

function getPaymentBalanceStr(bal: number): BalanceStr {
	return getBalanceStr(
		bal,
		groupData.value!.currency,
		(bal) => `receives ${bal}`,
		(bal) => `owes ${bal}`,
		() => "in balance"
	);
}
</script>

<template>
	<div class="w-full flex flex-col gap-4 items-center">
		<div class="w-full flex justify-between items-center">
			<div class="flex gap-2 justify-center items-center">
				<Button variant="ghost" class="size-9" @click="router.push(`/group/${routeGroupId}`)">
					<ArrowLeft class="!size-6" />
				</Button>
				<span class="text-lg font-semibold">Settle Up</span>
			</div>
			<div class="flex gap-2 justify-center items-center">
				<YourAccountSettings />
			</div>
		</div>

		<div class="w-full max-w-[32rem] flex flex-col gap-4">
			<div class="border border-border rounded-lg flex flex-col gap-6 p-4">
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Payments Needed</span>
					<span class="text-sm text-muted-foreground">
						Here's what needs to be <span class="font-bold">Setil</span>'d in this group
					</span>
				</div>

				<div class="flex flex-col gap-2">
					<div v-for="(user, userId) in users" class="flex flex-col gap-2">
						<div
							v-for="(owed, owedUserId) in Object.fromEntries(
								Object.entries(user.balance).filter(([, owed]) => owed < 0)
							)"
							class="flex flex-col border border-border rounded-lg gap-4 p-4"
						>
							<div class="flex justify-between items-center">
								<div class="flex items-center gap-2">
									<Avatar :src="users![userId].photoURL" :name="users![userId].name" class="size-10" />
									<div class="flex flex-col gap-1">
										<span class="text-sm">{{ users![userId].name }}</span>
										<BalanceStrBadge :balanceStr="getPaymentBalanceStr(owed)" />
									</div>
								</div>
								<div>
									<ArrowRight class="text-muted-foreground" />
								</div>
								<div class="flex items-center gap-2">
									<div class="flex flex-col gap-1 text-right">
										<span class="text-sm">{{ users![owedUserId].name }}</span>
										<BalanceStrBadge :balanceStr="getPaymentBalanceStr(-owed)" />
									</div>
									<Avatar :src="users![owedUserId].photoURL" :name="users![owedUserId].name" class="size-10" />
								</div>
							</div>
							<Button variant="outline">Record this payment</Button>
						</div>
					</div>
				</div>
			</div>
			<div class="border border-border rounded-lg flex flex-col gap-6 p-4">make a payment box</div>
		</div>
	</div>
</template>
