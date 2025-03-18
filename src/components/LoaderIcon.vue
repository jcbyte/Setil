<script setup lang="ts">
import { LoaderCircle, type LucideProps } from "lucide-vue-next";
import type { FunctionalComponent } from "vue";

defineProps<{
	icon: FunctionalComponent<LucideProps, {}, any, {}>;
	loading: boolean;
}>();
</script>

<template>
	<div v-if="loading" class="animate-spin">
		<LoaderCircle v-bind="$attrs" />
	</div>
	<icon v-else v-bind="$attrs" />
</template>
