import { defineStore } from "pinia";
import { ref } from "vue";
import type { GroupData, GroupUserData } from "../firebase/types";

export const useGroupStore = defineStore("group", () => {
	const groupId = ref<string | null>(null);
	const groupData = ref<GroupData | null>(null);
	const users = ref<Record<string, GroupUserData> | null>(null);

	return { groupId, groupData, users };
});
