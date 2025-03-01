import { defineStore, storeToRefs } from "pinia";
import { useToast } from "primevue";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import { getGroupData, getUsers } from "../firebase/firestore";
import type { GroupData, GroupUserData } from "../firebase/types";

const useGroupStore = defineStore("group", () => {
	const groupId = ref<string | null>(null);
	const groupData = ref<GroupData | null>(null);
	const users = ref<Record<string, GroupUserData> | null>(null);

	return { groupId, groupData, users };
});

export function useGroup(
	groupId: string | null,
	afterLoad: () => void = () => {}
): {
	groupId: Ref<string | null>;
	groupData: Ref<GroupData | null>;
	users: Ref<Record<string, GroupUserData> | null>;
} {
	const { groupId: currentGroupId, groupData, users } = storeToRefs(useGroupStore());

	const router = useRouter();
	const toast = useToast();

	function errorHome() {
		toast.add({
			severity: "error",
			summary: "Invalid Group",
			life: 2000,
		});

		router.push("/");
	}

	// Initially get the group data if it has not already been loaded
	onMounted(async () => {
		// If we already have the current groupId, then don't update
		if (groupId === currentGroupId.value) {
			afterLoad();
			return;
		}

		// Used to reset group data
		if (!groupId) {
			currentGroupId.value = null;
			afterLoad();
			return;
		}

		// Load all data
		const remoteGroupData = await getGroupData(groupId);
		if (!remoteGroupData) {
			// If the group cannot be found then return to the home page
			errorHome();
			return;
		}
		const remoteUsers = await getUsers(groupId);

		currentGroupId.value = groupId;
		groupData.value = remoteGroupData;
		users.value = remoteUsers;

		afterLoad();
	});

	return { groupId: currentGroupId, groupData, users };
}
