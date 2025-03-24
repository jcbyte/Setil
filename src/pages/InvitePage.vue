<script setup lang="ts">
import { useToast } from "@/components/ui/toast";
import { joinGroup } from "@/firebase/firestore";
import { getRouteParam } from "@/util/util";
import { Loader } from "lucide-vue-next";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { toast } = useToast();

const routeGroupId = getRouteParam(route.params.groupId);
const routeInviteCode = getRouteParam(route.params.inviteCode);

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
	<div class="flex flex-col items-center justify-center gap-4 border border-border p-8 min-w-80 rounded-lg">
		<Loader class="animate-spin !size-12" />
		<span class="text-muted-foreground font-semibold">Validating Invite Link</span>
	</div>
</template>
