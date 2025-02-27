import { defineStore } from "pinia";
import { ref } from "vue";
import type { GroupUserData } from "../firebase/firestore";

export const useGroupStore = defineStore("group", () => {
	const groupId = ref<string | null>(null);
	const users = ref<Record<string, GroupUserData> | null>(null);

	return { groupId, users };
});
