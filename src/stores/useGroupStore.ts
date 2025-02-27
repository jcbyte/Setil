import { defineStore } from "pinia";
import { ref } from "vue";
import type { GroupUserData, WithId } from "../firebase/firestore";

export const useGroupStore = defineStore("group", () => {
	const groupId = ref<string | null>(null);
	const users = ref<WithId<GroupUserData>[] | null>(null);

	return { groupId, users };
});
