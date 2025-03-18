<script setup lang="ts">
import GroupListItem from "@/components/GroupListItem.vue";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { getUserGroups, type ExtendedGroupData } from "@/firebase/firestore";
import { Plus } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const groups = ref<Record<string, ExtendedGroupData> | null>(null);

onMounted(() => {
	getUserGroups().then((groupsList) => {
		groups.value = groupsList;
	});
});
</script>

<template>
	<div class="w-full flex flex-col gap-4">
		<div class="flex justify-between">
			<span class="text-lg font-semibold">My Groups</span>
			<div class="flex gap-2 justify-center items-center">
				<YourAccountSettings />
				<Button @click="router.push('/create')">
					<Plus :stroke-width="3" />
					<span class="font-semibold">New Group</span>
				</Button>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<GroupListItem
				v-if="groups"
				v-for="(group, groupId) in groups"
				:group="group"
				@click="router.push(`/group/${groupId}`)"
			/>
			<Skeleton v-else v-for="_n in 3" class="rounded-lg h-[158px]" />
		</div>
	</div>
</template>
