import { defineStore, storeToRefs } from "pinia";
import { useToast } from "primevue";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import { getLiveGroupData, getTransactions, getUsers } from "../firebase/firestore";
import type { GroupData, GroupUserData, Transaction } from "../firebase/types";

const useGroupStore = defineStore("group", () => {
	const groupId = ref<string | null>(null);
	const groupData = ref<GroupData | null>(null);
	const users = ref<Record<string, GroupUserData> | null>(null);
	const transactions = ref<Record<string, Transaction> | null>(null);

	let groupDataUnsubscribe = ref<(() => void) | null>(null);

	return { groupId, groupData, users, transactions, groupDataUnsubscribe };
});

export function useGroup(
	groupId: string | null,
	afterLoad: () => void = () => {}
): {
	groupId: Ref<string | null>;
	groupData: Ref<GroupData | null>;
	users: Ref<Record<string, GroupUserData> | null>;
	transactions: Ref<Record<string, Transaction> | null>;
} {
	const {
		groupId: currentGroupId,
		groupData,
		users,
		transactions,
		groupDataUnsubscribe,
	} = storeToRefs(useGroupStore());

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
			groupData.value = null;
			users.value = null;
			transactions.value = null;
			afterLoad();
			return;
		}

		// Load all data
		try {
			groupDataUnsubscribe.value = await getLiveGroupData(groupId, groupData);
		} catch (error) {
			// If the group cannot be found then return to the home page
			errorHome();
			return;
		}
		const remoteUsers = await getUsers(groupId);
		const remoteTransactions = await getTransactions(groupId);

		currentGroupId.value = groupId;
		users.value = remoteUsers;
		transactions.value = remoteTransactions;

		afterLoad();
	});

	return { groupId: currentGroupId, groupData, users, transactions };
}
