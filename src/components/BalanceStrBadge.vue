<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { type BalanceStr } from "@/util/currency";

defineProps<{
	balanceStr: BalanceStr;
}>();
</script>

<template>
	<Badge v-if="balanceStr.status === 'neutral'" variant="secondary">
		{{ balanceStr.str }}
	</Badge>
	<Badge v-else-if="balanceStr.status === 'negative'" variant="destructive">
		{{ balanceStr.str }}
	</Badge>
	<Badge v-else variant="default" class="bg-emerald-600 hover:bg-emerald-700">
		{{ balanceStr.str }}
	</Badge>
</template>
