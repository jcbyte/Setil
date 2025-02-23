<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
	<div class="flex justify-center items-center">
		<div class="w-fit flex flex-col justify-center items-center gap-2">
			<p>Hello Vue</p>
			<button class="bg-zinc-300 p-2 rounded-lg text-zinc-900" type="button" @click="count++">
				count is {{ count }}
			</button>
		</div>
	</div>
</template>
