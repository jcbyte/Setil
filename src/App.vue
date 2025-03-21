<script setup lang="ts">
import Toaster from "@/components/ui/toast/Toaster.vue";
import { useCurrentUser } from "@/composables/useCurrentUser.ts";
import { useColorMode } from "@vueuse/core";
import { getAuth } from "firebase/auth";
import { LoaderCircle } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import SignInPage from "./pages/SignInPage.vue";

const firebaseLoaded = ref(false);
const { currentUser } = useCurrentUser();

onMounted(() => {
	getAuth().onAuthStateChanged(() => {
		firebaseLoaded.value = true;
	});
});

useColorMode().value = "dark";
</script>

<template>
	<div v-if="firebaseLoaded" class="flex justify-center items-center p-4">
		<SignInPage v-if="!currentUser" />
		<router-view v-else />
	</div>
	<div v-else class="flex flex-col justify-center items-center gap-4 w-full p-4 pt-12">
		<img src="/icon/icon-192.png" alt="App Logo" class="size-24" />
		<div class="flex gap-2 items-center">
			<LoaderCircle :stroke-width="3" class="animate-spin text-muted-foreground" />
			<p class="text-lg font-bold text-muted-foreground">Initialising Setil</p>
		</div>
	</div>

	<Toaster />
</template>
