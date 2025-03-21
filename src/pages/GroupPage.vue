<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import GroupActivity from "@/components/GroupActivity.vue";
import GroupSummary from "@/components/GroupSummary.vue";
import LoaderIcon from "@/components/LoaderIcon.vue";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import Tabs from "@/components/ui/tabs/Tabs.vue";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { useGroup } from "@/composables/useGroup";
import { inviteUser } from "@/util/app";
import { ArrowLeft, ReceiptText, Settings, UserRoundPlus, Wallet } from "lucide-vue-next";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupId, groupData, users, transactions } = useGroup(routeGroupId);

const currentTab = ref(
	route.query.tab && ["summary", "activity"].includes(String(route.query.tab)) ? String(route.query.tab) : "summary"
);
watch(currentTab, (newTab) => router.push({ query: { tab: newTab } }));

const isAddingMember = ref<boolean>(false);

async function addMember() {
	if (!groupId.value) return;

	isAddingMember.value = true;
	await inviteUser(groupId.value, groupData.value!.name);
	isAddingMember.value = false;
}
</script>

<template>
	<div class="w-full flex flex-col gap-4 items-center">
		<div class="w-full flex justify-between items-center">
			<div class="flex gap-2 justify-center items-center">
				<Button variant="ghost" class="size-9" @click="router.push('/')">
					<ArrowLeft class="!size-6" />
				</Button>
				<span v-if="groupId" class="text-lg font-semibold">{{ groupData!.name }}</span>
				<Skeleton v-else class="w-20 h-7" />
			</div>
			<div class="flex gap-2 justify-center items-center">
				<YourAccountSettings />
				<Button variant="outline" class="size-9" @click="router.push(`/group/${groupId}/edit`)">
					<Settings class="!size-5" />
				</Button>
			</div>
		</div>

		<div class="flex flex-col justify-center md:flex-row gap-2 w-full">
			<div class="flex-1 flex flex-col gap-2 w-full md:max-w-[36rem]">
				<Tabs :default-value="route.query.tab ? String(route.query.tab) : 'summary'" v-model:model-value="currentTab">
					<TabsList class="grid w-full grid-cols-2">
						<TabsTrigger value="summary">Summary</TabsTrigger>
						<TabsTrigger value="activity">Activity</TabsTrigger>
					</TabsList>
				</Tabs>
				<div v-if="groupId">
					<!-- <Transition name="tab-anim" mode="out-in"> -->
					<GroupSummary v-if="currentTab === 'summary'" :group-data="groupData!" :users="users!" />
					<GroupActivity
						v-else
						:group-id="groupId"
						:group-data="groupData!"
						:users="users!"
						:transactions="transactions!"
					/>
					<!-- </Transition> -->
				</div>
				<Skeleton v-else class="w-full h-96" />

				<div class="flex w-full gap-2">
					<Button
						v-for="groupButton in [
							{
								icon: ReceiptText,
								title: 'Add Expense',
								description: 'Record a new expense',
								onClick: () => router.push(`/group/${groupId}/transaction`),
							},
							{
								icon: Wallet,
								title: 'Settle Up',
								description: 'Settle member\'s debts',
								onClick: () => router.push(`/group/${groupId}/settle`),
							},
						]"
						variant="outline"
						class="h-full flex-1 p-4"
						@click="groupButton.onClick"
					>
						<div class="flex flex-col justify-center items-center gap-2">
							<div class="bg-secondary p-3 rounded-lg aspect-square flex justify-center items-center">
								<component :is="groupButton.icon" class="!size-7" />
							</div>
							<div class="flex flex-col justify-center items-center">
								<span class="text-md font-semibold">{{ groupButton.title }}</span>
								<span class="text-sm text-muted-foreground">{{ groupButton.description }}</span>
							</div>
						</div>
					</Button>
				</div>
			</div>

			<div
				v-if="groupId"
				class="border border-border rounded-lg p-4 flex flex-col gap-2 h-fit w-full md:w-auto md:max-w-72 lg:max-w-96"
			>
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Group Info</span>
					<span v-if="groupData!.description" class="text-sm text-muted-foreground">Description</span>
					<span v-if="groupData!.description" class="text-sm">{{ groupData!.description }}</span>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground font-semibold">
						Members ({{ Object.values(users!).filter((user) => user.status === "active").length }})
					</span>
					<div class="flex gap-2 flex-wrap">
						<div
							v-if="users"
							v-for="user in Object.values(users).filter((user) => user.status === 'active')"
							class="flex gap-1 justify-center items-center"
						>
							<Avatar :src="user.photoURL" :name="user.name" class="size-7" />
							<span class="text-sm">{{ user.name }}</span>
						</div>
					</div>
				</div>
				<Button variant="outline" :disabled="isAddingMember" @click="addMember">
					<LoaderIcon :icon="UserRoundPlus" :loading="isAddingMember" />
					<span>Add Member</span>
				</Button>
			</div>
			<Skeleton v-else class="h-64 w-full md:max-w-72 lg:max-w-96" />
		</div>
	</div>
</template>

<style scoped>
.tab-anim-enter-active,
.tab-anim-leave-active {
	transition: 0.2s ease;
}

.tab-anim-enter-from {
	opacity: 0;
	transform: translateX(-1rem);
}
.tab-anim-leave-to {
	opacity: 0;
	transform: translateX(1rem);
}
</style>
