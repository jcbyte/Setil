<script setup lang="ts">
import { LoaderCircle, type LucideProps } from "lucide-vue-next";
import type { FunctionalComponent } from "vue";

defineProps<{
	icon: FunctionalComponent<LucideProps, {}, any, {}>;
	loading: boolean;
}>();
</script>

<template>
	<component :is="loading ? LoaderCircle : icon" v-bind="$attrs" />
</template>
