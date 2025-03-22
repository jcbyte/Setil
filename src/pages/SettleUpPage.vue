<script setup lang="ts">
import { Button } from "@/components/ui/button";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { useGroup } from "@/composables/useGroup";
import { ArrowLeft } from "lucide-vue-next";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const { groupId, groupData, users } = useGroup(routeGroupId);
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
	</div>
</template>
