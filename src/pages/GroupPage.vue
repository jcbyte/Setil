<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { useGroup } from "@/composables/useGroup";
import { routerBackWithFallback } from "@/util/util";
import { useRoute, useRouter } from "vue-router";
import GroupOverview from "./group/GroupOverview.vue";
import GroupTransactions from "./group/GroupTransactions.vue";

const route = useRoute();
const router = useRouter();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupId, groupData } = useGroup(routeGroupId);
</script>

<template>
	<div class="w-full flex flex-col gap-4 items-center">
		<div class="w-full flex justify-between items-center">
			<div class="flex gap-2 justify-center items-center">
				<Button variant="ghost" class="size-9" @click="routerBackWithFallback(router, '/')">
					<i class="pi pi-arrow-left" />
				</Button>
				<span class="text-lg font-semibold">{{ groupData?.name }}</span>
			</div>
			<div class="flex gap-2 justify-center items-center">
				<YourAccountSettings />
				<Button variant="outline" class="size-9" @click="router.push(`/group/${groupId}/edit`)">
					<i class="pi pi-cog" />
				</Button>
			</div>
		</div>

		<div class="flex justify-between">
			<div>
				<Tabs default-value="summary" class="w-[400px]">
					<TabsList class="grid w-full grid-cols-2">
						<TabsTrigger value="summary" @click="console.log(2)">Summary</TabsTrigger>
						<TabsTrigger value="activity">Activity</TabsTrigger>
					</TabsList>
					<TabsContent value="summary">
						<GroupOverview />
					</TabsContent>
					<TabsContent value="activity">
						<GroupTransactions />
					</TabsContent>
				</Tabs>
			</div>
			<div>todo group info here</div>
		</div>

		<!-- <div class="fixed right-8 bottom-8">
			<router-link :to="`/group/${groupId}/transaction`">
				<Button icon="pi pi-plus" label="New Transaction" />
			</router-link>
		</div>-->
	</div>
</template>
