<script setup lang="ts">
import { requestPushNotificationPermission } from "@/firebase/messaging";
import { onMounted } from "vue";

onMounted(() => {
	requestPushNotificationPermission();
});
</script>

<template></template>
