import { collection, doc, getFirestore, onSnapshot } from "firebase/firestore";
import type { Ref } from "vue";
import { app } from "../firebase";
import type { GroupData, GroupUserData, Transaction } from "../types";

const db = getFirestore(app);

/**
 * Get a live copy of a group's general data synced to a vue ref.
 * @param groupId id of the group.
 * @param groupDataRef the ref to sync the group data to.
 * @returns the unsubscribe function.
 */
export async function getLiveGroupData(groupId: string, groupDataRef: Ref<GroupData | null>): Promise<() => void> {
	// Clear the group data ref to reset it
	groupDataRef.value = null;

	const groupRef = doc(db, "groups", groupId);

	return await new Promise<() => void>((resolve, reject) => {
		// Setup listener to update ref
		const unsubscribe = onSnapshot(
			groupRef,
			(doc) => {
				if (doc.exists()) {
					groupDataRef.value = doc.data() as GroupData;
					// Only continue once data has been first loaded
					resolve(unsubscribe);
				} else {
					reject(new Error(`Group ${groupId} does not exist.`));
				}
			},
			(e) => {
				reject(new Error(`Error ${e.message}.`));
			}
		);
	});
}

/**
 * Get a live copy of a group's transactions synced to a vue ref.
 * @param groupId id of the group.
 * @param transactionsRef the ref to sync the transactions data to.
 * @returns the unsubscribe function.
 */
export async function getLiveTransactions(
	groupId: string,
	transactionsRef: Ref<Record<string, Transaction> | null>
): Promise<() => void> {
	// Clear the transactions ref to reset it
	transactionsRef.value = null;

	const firestoreTransactionsRef = collection(db, "groups", groupId, "transactions");

	// Initialise transactions if they have not been yet
	if (!transactionsRef.value) transactionsRef.value = {};

	return await new Promise<() => void>((resolve) => {
		// Setup listener to update ref

		const unsubscribe = onSnapshot(firestoreTransactionsRef, (snap) => {
			snap.docChanges().forEach((change) => {
				if (change.type === "added" || change.type === "modified") {
					transactionsRef.value![change.doc.id] = change.doc.data() as Transaction;
				} else if (change.type === "removed") {
					delete transactionsRef.value![change.doc.id];
				}
			});

			// Only continue once data has been first loaded
			resolve(unsubscribe);
		});
	});
}

/**
 * Get a live copy of a group's users synced to a vue ref.
 * @param groupId id of the group.
 * @param usersRef the ref to sync the user data to.
 * @returns the unsubscribe function.
 */
export async function getLiveUsers(
	groupId: string,
	usersRef: Ref<Record<string, GroupUserData> | null>
): Promise<() => void> {
	// Clear the users ref to reset it
	usersRef.value = null;

	const firestoreUsersRef = collection(db, "groups", groupId, "users");

	// Initialise users if they have not been yet
	if (!usersRef.value) usersRef.value = {};

	return await new Promise<() => void>((resolve) => {
		// Setup listener to update ref

		const unsubscribe = onSnapshot(firestoreUsersRef, (snap) => {
			snap.docChanges().forEach((change) => {
				if (change.type === "added" || change.type === "modified") {
					usersRef.value![change.doc.id] = change.doc.data() as GroupUserData;
				} else if (change.type === "removed") {
					delete usersRef.value![change.doc.id];
				}
			});

			// Only continue once data has been first loaded
			resolve(unsubscribe);
		});
	});
}
