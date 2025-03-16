<script setup lang="ts">
import { Skeleton } from "@/components/ui/skeleton";
import { getAuth } from "firebase/auth";
import { Toast } from "primevue";
import { onMounted, ref } from "vue";
import SignInPage from "./pages/SignInPage.vue";

import { useColorMode } from "@vueuse/core";

const firebaseLoaded = ref(false);
const currentUser = ref(getAuth().currentUser);

onMounted(() => {
	getAuth().onAuthStateChanged((user) => {
		firebaseLoaded.value = true;
		currentUser.value = user;
	});
});

useColorMode().value = "dark";
</script>

<template>
	<div v-if="firebaseLoaded" class="flex justify-center items-center p-4">
		<SignInPage v-if="!currentUser" />
		<router-view v-else />
	</div>
	<div v-else class="flex justify-center w-full p-4">
		<Skeleton class="w-9/12 h-80" />
	</div>

	<Toast position="top-center" />
</template>
