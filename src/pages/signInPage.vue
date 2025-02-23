<script setup lang="ts">
import { signInWithGoogle } from "../firebase/auth";
</script>

<template>
	<div>
		<div class="p-4 bg-red-500" @click="signInWithGoogle()">Google Sign In</div>
	</div>
</template>
