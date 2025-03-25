import { collection, CollectionReference, doc, getFirestore, onSnapshot } from "firebase/firestore";
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
			(e) => reject(e)
		);
	});
}

async function getLiveCollection<T>(
	collectionRef: CollectionReference,
	vueRef: Ref<Record<string, T> | null>
): Promise<() => void> {
	// Initialize vueRef with an empty object to reset it
	vueRef.value = {} as Record<string, T>;

	return new Promise<() => void>((resolve, reject) => {
		// Setup listener to update ref
		const unsubscribe = onSnapshot(
			collectionRef,
			(snap) => {
				snap.docChanges().forEach((change) => {
					if (change.type === "added" || change.type === "modified") {
						vueRef.value![change.doc.id] = change.doc.data() as T;
					} else if (change.type === "removed") {
						delete vueRef.value![change.doc.id];
					}
				});

				// Only continue once data has been first loaded
				resolve(unsubscribe);
			},
			(e) => reject(e.message)
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
	const firestoreTransactionsRef = collection(db, "groups", groupId, "transactions");
	return getLiveCollection(firestoreTransactionsRef, transactionsRef);
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
	const firestoreUsersRef = collection(db, "groups", groupId, "users");
	return getLiveCollection(firestoreUsersRef, usersRef);
}
