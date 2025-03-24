import { useToast } from "@/components/ui/toast";
import { useCurrentUser } from "@/composables/useCurrentUser";
import { getLiveGroupData, getLiveTransactions, getLiveUsers } from "@/firebase/firestore";
import type { GroupData, GroupUserData, Transaction } from "@/firebase/types";
import { defineStore, storeToRefs } from "pinia";
import { onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";

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
	const { currentUser } = useCurrentUser();

	// Initially get the group data if it has not already been loaded
	onMounted(async () => {
		function errorHome() {
			toast({
				title: "Group not found",
				description: "Ensure you are a member of this group",
				variant: "destructive",
				duration: 5000,
			});

			router.push("/");
		}

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
			errorHome();
			return;
		}

		// Load users data
		usersUnsubscribe.value = await getLiveUsers(groupId, users);

		// If the user is not active in the group then return to the home page
		if (users.value![currentUser.value!.uid].status !== "active") {
			groupDataUnsubscribe.value();
			usersUnsubscribe.value();
			errorHome();
			return;
		}

		// Load transactions data
		transactionsUnsubscribe.value = await getLiveTransactions(groupId, transactions);

		// Set this last once, everything else has been set so that anything checking groupId !== null does not happen preemptively
		currentGroupId.value = groupId;

		afterLoad();
	});

	return { groupId: currentGroupId, groupData, users, transactions };
}
