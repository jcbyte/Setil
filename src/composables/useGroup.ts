import { useToast } from "@/components/ui/toast";
import { defineStore, storeToRefs } from "pinia";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import { getLiveGroupData, getLiveTransactions, getLiveUsers } from "../firebase/firestore";
import type { GroupData, GroupUserData, Transaction } from "../firebase/types";

const useGroupStore = defineStore("group", () => {
	const groupId = ref<string | null>(null);
	const groupData = ref<GroupData | null>(null);
	const users = ref<Record<string, GroupUserData> | null>(null);
	const transactions = ref<Record<string, Transaction> | null>(null);

	let groupDataUnsubscribe = ref<(() => void) | null>(null);
	let usersUnsubscribe = ref<(() => void) | null>(null);
	let transactionsUnsubscribe = ref<(() => void) | null>(null);

	return { groupId, groupData, users, transactions, groupDataUnsubscribe, usersUnsubscribe, transactionsUnsubscribe };
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
		usersUnsubscribe,
		transactionsUnsubscribe,
	} = storeToRefs(useGroupStore());

	const { toast } = useToast();
	const router = useRouter();

	// Initially get the group data if it has not already been loaded
	onMounted(async () => {
		// If we already have the current groupId, then don't update
		if (groupId === currentGroupId.value) {
			afterLoad();
			return;
		}

		currentGroupId.value = null;

		// Unsubscribe from existing listeners
		if (groupDataUnsubscribe.value) groupDataUnsubscribe.value();
		if (usersUnsubscribe.value) usersUnsubscribe.value();
		if (transactionsUnsubscribe.value) transactionsUnsubscribe.value();

		// Used to reset group data
		if (!groupId) {
			currentGroupId.value = null;
			groupData.value = null;
			users.value = null;
			transactions.value = null;
			afterLoad();
			return;
		}

		// Load group data
		try {
			groupDataUnsubscribe.value = await getLiveGroupData(groupId, groupData);
		} catch {
			// If the group cannot be found then return to the home page
			toast({
				title: "Group not found",
				description: "Ensure you are a member of this group",
				variant: "destructive",
				duration: 5000,
			});

			router.push("/");
			return;
		}

		// Load users data
		usersUnsubscribe.value = await getLiveUsers(groupId, users);

		// Load transactions data
		transactionsUnsubscribe.value = await getLiveTransactions(groupId, transactions);

		// Set this last once, everything else has been set so that anything checking groupId !== null does not happen preemptively
		currentGroupId.value = groupId;

		afterLoad();
	});

	return { groupId: currentGroupId, groupData, users, transactions };
}
