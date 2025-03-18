<script setup lang="ts">
import { useToast } from "@/components/ui/toast";
import { joinGroup } from "@/firebase/firestore";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { toast } = useToast();

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const routeInviteCode = Array.isArray(route.params.inviteCode)
	? route.params.inviteCode[0]
	: route.params.inviteCode || null;

onMounted(async () => {
	function errorHome() {
		toast({
			title: "Could not join Group",
			description: "Ensure this is a valid link and that it has not expired.",
			variant: "destructive",
			duration: 5000,
		});
		router.push(`/`);
	}

	if (!routeGroupId || !routeInviteCode) {
		errorHome();
		return;
	}

	const joined = await joinGroup(routeGroupId, routeInviteCode);
	if (joined) {
		toast({ title: "Joined group", description: "Time to make cents of things.", duration: 5000 });
		router.push(`/group/${routeGroupId}`);
	} else {
		errorHome();
		return;
	}
});
</script>

<template>
	<div class="w-full flex flex-col gap-4">
		<div>
			<span class="text-lg font-semibold">Joining Group</span>
		</div>
		<div class="flex justify-center">
			<div class="flex flex-col gap-2 justify-center items-center border border-border p-8 min-w-80 rounded-lg">
				<div>
					<i class="pi pi-spin pi-spinner text-[3rem]" />
				</div>
				<span class="text-muted-foreground font-semibold">Validating Invite Link</span>
			</div>
		</div>
	</div>
</template>
