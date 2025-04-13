import { getUserGroups, type ExtendedGroupData } from "@/firebase/firestore/user";
import { defineStore, storeToRefs } from "pinia";
import { ref, type Ref } from "vue";

const useCurrentUserStore = defineStore("groupList", () => {
	const groupList = ref<Record<string, ExtendedGroupData> | null>(null);

	return { groupList };
});

// Composable wrapper for the store
export function useGroupList(): {
	groupList: Ref<Record<string, ExtendedGroupData> | null>;
	refreshList: () => Promise<void>;
} {
	const { groupList } = storeToRefs(useCurrentUserStore());

	async function refreshList(): Promise<void> {
		groupList.value = await getUserGroups();
	}

	return { groupList, refreshList };
}
