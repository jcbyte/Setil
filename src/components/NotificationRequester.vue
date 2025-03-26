<script setup lang="ts">
import { useToast } from "@/components/ui/toast";
import { requestPushNotificationPermission } from "@/firebase/messaging";
import { onMounted } from "vue";

const { toast } = useToast();

onMounted(async () => {
	// If the user has previously denied notifications do not try and request them again
	if (Notification.permission === "denied") return;

	try {
		await requestPushNotificationPermission();
	} catch (error: any) {
		toast({
			title: "Notifications Not Enabled",
			description: error.message,
			variant: "destructive",
			duration: 5000,
		});
	}
});
</script>

<template></template>
