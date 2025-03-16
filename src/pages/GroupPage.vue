<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import GroupActivity from "@/components/GroupActivity.vue";
import GroupSummary from "@/components/GroupSummary.vue";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { useGroup } from "@/composables/useGroup";
import { inviteUser } from "@/util/util";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupId, groupData, users, transactions } = useGroup(routeGroupId);

const isAddingMember = ref<boolean>(false);
async function addMember() {
	if (!groupId.value) return;

	isAddingMember.value = true;
	await inviteUser(groupId.value);
	isAddingMember.value = false;
}
</script>

<template>
	<div class="w-full flex flex-col gap-4 items-center">
		<div class="w-full flex justify-between items-center">
			<div class="flex gap-2 justify-center items-center">
				<Button variant="ghost" class="size-9" @click="router.push('/')">
					<i class="pi pi-arrow-left" />
				</Button>
				<span v-if="groupId" class="text-lg font-semibold">{{ groupData!.name }}</span>
				<Skeleton v-else class="w-20 h-7" />
			</div>
			<div class="flex gap-2 justify-center items-center">
				<YourAccountSettings />
				<Button variant="outline" class="size-9" @click="router.push(`/group/${groupId}/edit`)">
					<i class="pi pi-cog" />
				</Button>
			</div>
		</div>

		<div class="flex gap-4 w-full">
			<div class="flex-1 flex flex-col gap-2">
				<Tabs default-value="summary">
					<TabsList class="grid w-full grid-cols-2">
						<TabsTrigger value="summary">Summary</TabsTrigger>
						<TabsTrigger value="activity">Activity</TabsTrigger>
					</TabsList>

					<TabsContent value="summary">
						<GroupSummary v-if="groupId" :group-data="groupData!" :users="users!" />
						<Skeleton v-else class="w-full h-96" />
					</TabsContent>

					<TabsContent value="activity">
						<GroupActivity
							v-if="groupId"
							:group-id="groupId"
							:group-data="groupData!"
							:users="users!"
							:transactions="transactions!"
						/>
						<Skeleton v-else class="w-full h-96" />
					</TabsContent>
				</Tabs>

				<div class="flex w-full gap-2">
					<div
						v-for="groupButton in [
							{
								icon: 'pi-receipt',
								title: 'Add Expense',
								description: 'Record a new expense',
								onClick: () => router.push(`/group/${groupId}/transaction`),
							},
							{
								icon: 'pi-wallet',
								title: 'Settle Up',
								description: 'Settle member\'s debts',
								onClick: () => router.push(`/group/${groupId}/settle`),
							},
						]"
						class="border border-zinc-800 rounded-lg flex-1 flex flex-col p-4 justify-center items-center gap-2"
						@click="groupButton.onClick"
					>
						<div class="bg-zinc-500/20 p-3 rounded-lg aspect-square flex justify-center items-center">
							<i :class="`pi ${groupButton.icon} !text-[26px]`" />
						</div>
						<div class="flex flex-col justify-center items-center">
							<span class="text-md font-semibold">{{ groupButton.title }}</span>
							<span class="text-sm text-zinc-400">{{ groupButton.description }}</span>
						</div>
					</div>
				</div>
			</div>

			<div v-if="groupId" class="border border-zinc-800 rounded-lg p-4 flex flex-col gap-2 h-fit w-64">
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Group Info</span>
					<span class="text-sm text-zinc-400">Description</span>
					<span class="text-md">{{ groupData?.description }}</span>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-sm text-zinc-400 font-semibold">Members ({{ Object.keys(users!).length }})</span>
					<div class="flex gap-2 flex-wrap">
						<div v-for="user in users" class="flex gap-1 justify-center items-center">
							<Avatar :src="user.photoURL" :name="user.name" class="size-7" />
							<span class="text-sm">{{ user.name }}</span>
						</div>
					</div>
				</div>
				<Button variant="outline" :disabled="isAddingMember" @click="addMember">
					<i :class="`pi ${isAddingMember ? 'pi pi-spin pi-spinner' : 'pi-user-plus'}`" />
					<span>Add Member</span>
				</Button>
			</div>
			<Skeleton v-else class="w-64 h-64" />
		</div>
	</div>
</template>
