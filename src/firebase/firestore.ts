import { getAuth, type User } from "firebase/auth";
import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	deleteField,
	doc,
	getCountFromServer,
	getDoc,
	getDocs,
	getFirestore,
	increment,
	limit,
	onSnapshot,
	orderBy,
	query,
	setDoc,
	Timestamp,
	updateDoc,
	writeBatch,
} from "firebase/firestore";
import type { Ref } from "vue";
import { app } from "./firebase";
import type { GroupData, GroupUserData, Invite, Transaction, UserData } from "./types";

const db = getFirestore(app);

/**
 * Get the user's uid.
 * @returns the user's uid.
 * @throws an error if the user is not signed in.
 */
export function getUser(): User {
	const user = getAuth().currentUser;
	if (!user) throw new Error("User not signed in");

	return user;
}

/**
 * Initialise the users data area if is does not exist.
 * @returns true if the data was initialised.
 */
export async function initialiseUserData(): Promise<boolean> {
	const user = getUser();

	const userRef = doc(db, "users", user.uid);
	const userDocSnap = await getDoc(userRef);

	// Do nothing if the user already exists
	if (userDocSnap.exists()) return false;

	// Create the users data area
	const newUserTemplate: UserData = {
		groups: [],
	};
	await setDoc(userRef, structuredClone(newUserTemplate));
	return true;
}

/**
 * Get a live copy of a group's general data synced to a vue ref.
 * @param groupId id of the group.
 * @param groupDataRef the ref to sync the group data to.
 * @returns the unsubscribe function.
 */
export async function getLiveGroupData(groupId: string, groupDataRef: Ref<GroupData | null>): Promise<() => void> {
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

export interface ExtendedGroupData extends GroupData {
	topUsers: GroupUserData[];
	userCount: number;
	myself: GroupUserData;
}

/**
 * Get a list of the user's groups, including there extended data.
 * @param removeUnknownGroups if true, groups that the user does not have access to or have been deleted will be removed from the user.
 * @returns a list of the user's groups, including there data.
 * @throws an error if the user does not exist.
 */
export async function getUserGroups(removeUnknownGroups: boolean = true): Promise<Record<string, ExtendedGroupData>> {
	const user = getUser();

	const userRef = doc(db, "users", user.uid);
	const userDocSnap = await getDoc(userRef);
	// Throw if the user data has not been initialised
	if (!userDocSnap.exists()) throw new Error("User data does not exist");

	const userData = userDocSnap.data() as UserData;
	let unknownGroups: string[] = [];

	// Get the data for each group
	const userGroups = Object.fromEntries(
		(
			await Promise.all(
				userData.groups.map(async (id) => {
					const groupRef = doc(db, "groups", id);
					// If this throws, most likely the user does not have permission to access the group
					const groupDocSnap = await getDoc(groupRef).catch(() => null);

					// If the group does not exist, add it to the unknown groups list to be removed later
					if (!groupDocSnap || !groupDocSnap.exists()) {
						unknownGroups.push(id);
						return null;
					}

					const baseGroupData = groupDocSnap.data() as GroupData;

					// Get the extended group data
					const groupUsersRef = collection(groupRef, "users");
					const usersCount = await getCountFromServer(groupUsersRef);
					const topUsersQuery = query(groupUsersRef, orderBy("lastUpdate"), limit(3));
					const topUsersSnap = await getDocs(topUsersQuery);

					const myselfSnap = await getDoc(doc(groupUsersRef, user.uid));

					const data: ExtendedGroupData = {
						...baseGroupData,
						topUsers: topUsersSnap.docs.map((topUserSnap) => topUserSnap.data() as GroupUserData),
						userCount: usersCount.data().count,
						myself: myselfSnap.data() as GroupUserData,
					};

					return [id, data];
				})
			)
		)
			// Filter out null values
			.filter((group) => group !== null)
	);

	// Remove unknown groups from the user's data if required
	if (removeUnknownGroups && unknownGroups.length > 0) {
		updateDoc(userRef, {
			groups: arrayRemove(...unknownGroups),
		});
	}

	return userGroups;
}

/**
 * Create a new group and add the user to it.
 * @param groupData the data for the new group.
 * @returns the id of the new group.
 */
export async function createGroup(groupData: Omit<GroupData, "owner">): Promise<string> {
	const user = getUser();

	// Create the group
	const groupsRef = collection(db, "groups");
	const groupRef = await addDoc(groupsRef, { ...groupData, owner: user.uid });

	// Add the user to the group
	const groupUsersRef = doc(groupRef, "users", user.uid);
	const groupUserData: GroupUserData = {
		name: user.displayName ?? "Unknown User",
		photoURL: user.photoURL,
		active: true,
		balance: {},
		lastUpdate: Timestamp.now(),
	};
	await setDoc(groupUsersRef, groupUserData);

	// Add the group to the user
	const userRef = doc(db, "users", user.uid);
	await updateDoc(userRef, {
		groups: arrayUnion(groupRef.id),
	});

	return groupRef.id;
}

/**
 * Update a group with new data.
 * @param groupId id of the group.
 * @param groupData the parts of the group to update.
 */
export async function updateGroup(groupId: string, groupData: Partial<Omit<GroupData, "owner">>): Promise<void> {
	// Update the group
	const groupRef = doc(db, "groups", groupId);
	await updateDoc(groupRef, groupData);
}

/**
 * Deletes the group.
 * @param groupId id of the group.
 */
export async function deleteGroup(groupId: string) {
	// Delete the group
	// The group will be removed from other users groups when they call `getUserGroups`
	const groupRef = doc(db, "groups", groupId);
	await deleteDoc(groupRef);
}

/**
 * User leaves the group.
 * The users data will not be deleted from the group but they will no longer see it in there menu.
 * @param groupId id of the group.
 */
export async function leaveGroup(groupId: string) {
	const user = getUser();

	// Set the users active state to false to show they have left
	const firestoreGroupUsersRef = doc(db, "groups", groupId, "users", user.uid);
	await updateDoc(firestoreGroupUsersRef, { active: false });

	// Remove group from users list so it will not show up
	const userRef = doc(db, "users", user.uid);
	await updateDoc(userRef, { groups: arrayRemove(groupId) });

	// If user is owner then pass this to a different user
	const groupRef = doc(db, "groups", groupId);
	const groupDocSnap = await getDoc(groupRef);
	const groupData = groupDocSnap.data() as GroupData;

	if (groupData.owner === user.uid) {
		const firestoreUsersRef = collection(db, "groups", groupId, "users");
		const userSnaps = await getDocs(firestoreUsersRef);

		const newOwner = userSnaps.docs.find((userSnap) => (userSnap.data() as GroupUserData).active);
		if (newOwner) {
			await updateDoc(groupRef, { owner: newOwner.id });
		} else {
			// Delete the group if the are no active users left
			await deleteGroup(groupId);
		}
	}
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

/**
 * Create a transaction in a group and update relevant users balances.
 * @param groupId id of the group.
 * @param transaction transaction data.
 * @returns the id of the new transaction.
 */
export async function createTransaction(groupId: string, transaction: Transaction): Promise<string> {
	const batch = writeBatch(db);

	// Add the transaction to the group
	const groupRef = doc(db, "groups", groupId);
	const groupTransactionsRef = collection(groupRef, "transactions");
	const transactionRef = await addDoc(groupTransactionsRef, transaction);

	const fromUserRef = doc(groupRef, "users", transaction.from);

	// Update each receiver with their new balances
	Object.entries(transaction.to).forEach(([toUser, toAmount]) => {
		// If the receiver is the sender this will make no changes, so ignore
		if (toUser === transaction.from) return;

		const userRef = doc(groupRef, "users", toUser);

		batch.update(fromUserRef, { [`balance.${toUser}`]: increment(toAmount) });
		batch.update(userRef, { [`balance.${transaction.from}`]: increment(-toAmount) });
	});

	// Update the time when the current user has last added a transaction
	const user = getUser();
	const thisUserRef = doc(groupRef, "users", user.uid);
	batch.update(thisUserRef, { lastUpdate: Timestamp.now() });

	// Update the last update field for the group
	batch.update(groupRef, { lastUpdate: Timestamp.now() });

	await batch.commit();

	// Return id of newly created transition
	return transactionRef.id;
}

/**
 * Update a transaction in a group and update relevant users balances.
 * @param groupId id of the group.
 * @param transactionId id of the transaction.
 * @param transaction new transaction data.
 */
export async function updateTransaction(
	groupId: string,
	transactionId: string,
	transaction: Transaction
): Promise<void> {
	// todo implement
	// // Get the existing transaction data
	// const transactionRef = doc(db, "groups", groupId, "transactions", transactionId);
	// const transactionSnap = await getDoc(transactionRef);
	// const oldTransaction = transactionSnap.data() as Transaction;
	// // Update the transaction to the group
	// await setDoc(transactionRef, transaction);
	// // Work out the original and new changes in balances for each user based on the transaction
	// const oldBalancesDelta = calculateDeltas(oldTransaction.from, oldTransaction.to);
	// const balancesDelta = calculateDeltas(transaction.from, transaction.to);
	// // Calculate balancesDelta delta
	// for (const userId in oldBalancesDelta) {
	// 	if (!balancesDelta[userId]) balancesDelta[userId] = {};
	// 	for (const receiverId in oldBalancesDelta[userId]) {
	// 		if (!balancesDelta[userId][receiverId]) balancesDelta[userId][receiverId] = 0;
	// 		balancesDelta[userId][receiverId] -= oldBalancesDelta[userId][receiverId];
	// 	}
	// }
	// // Update balances in firestore
	// const batch = writeBatch(db);
	// Object.entries(balancesDelta).forEach(([userId, balanceDelta]) => {
	// 	const userRef = doc(db, "groups", groupId, "users", userId);
	// 	batch.update(
	// 		userRef,
	// 		Object.fromEntries(
	// 			Object.entries(balanceDelta).map(([userId2, amount]) => [`balance.${userId2}`, increment(amount)])
	// 		)
	// 	);
	// });
	// await batch.commit();
}

/**
 * Delete a transaction in a group and update relevant users balances.
 * @param groupId id of the group.
 * @param transactionId id of the transaction.
 */
export async function deleteTransaction(groupId: string, transactionId: string): Promise<void> {
	const groupRef = doc(db, "groups", groupId);

	// Get the existing transaction data
	const transactionRef = doc(groupRef, "transactions", transactionId);
	const transactionSnap = await getDoc(transactionRef);
	const transaction = transactionSnap.data() as Transaction;

	const batch = writeBatch(db);

	// Delete the transaction from the group
	batch.delete(transactionRef);

	const fromUserRef = doc(groupRef, "users", transaction.from);

	// Update each receiver to revert their balances
	Object.entries(transaction.to).forEach(([toUser, toAmount]) => {
		// If the receiver is the sender this will make no changes, so ignore
		if (toUser === transaction.from) return;

		const userRef = doc(groupRef, "users", toUser);

		// Inverted transaction
		batch.update(fromUserRef, { [`balance.${toUser}`]: increment(-toAmount) });
		batch.update(userRef, { [`balance.${transaction.from}`]: increment(toAmount) });
	});

	// Update the time when the current user has updated the group
	const user = getUser();
	const thisUserRef = doc(groupRef, "users", user.uid);
	batch.update(thisUserRef, { lastUpdate: Timestamp.now() });

	// Update the last update field for the group
	batch.update(groupRef, { lastUpdate: Timestamp.now() });

	await batch.commit();
}

/**
 * Create an invite to the group which will automatically expire.
 * @param groupId id of the group.
 * @param expiry amount of time in ms when the invite will expire.
 * @returns the invite code.
 */
export async function invite(groupId: string, expiry: number): Promise<string> {
	const groupInvitesRef = collection(db, "groups", groupId, "invites");

	// Calculate the expiry date
	const inviteData: Invite = {
		expiry: Timestamp.fromMillis(Date.now() + expiry),
	};

	const inviteRef = await addDoc(groupInvitesRef, inviteData);

	return inviteRef.id;
}

/**
 * Cleans up expired invites in a group.
 * @param groupId id of the group.
 */
export async function cleanupInvites(groupId: string): Promise<void> {
	const groupInvitesRef = collection(db, "groups", groupId, "invites");

	const invitesSnap = await getDocs(groupInvitesRef);

	// Find all expired invites
	const now = Date.now();
	const expiredInvites = invitesSnap.docs
		.filter((inviteSnap) => (inviteSnap.data() as Invite).expiry.toMillis() < now)
		.map((expiredInvite) => expiredInvite.ref);

	// Delete each of these
	for (const expiredInvite of expiredInvites) {
		deleteDoc(expiredInvite);
	}
}

/**
 * Try and join a group with an invite code.
 * @param groupId id of the group.
 * @param inviteCode invite code to join the group.
 * @returns true if the user joins (or is already in) the group.
 */
export async function joinGroup(groupId: string, inviteCode: string): Promise<boolean> {
	const user = getUser();

	// Add the group to the user if it is not already there
	const userRef = doc(db, "users", user.uid);
	const userSnap = await getDoc(userRef);
	const userData = userSnap.data() as UserData;

	if (!userData.groups.includes(groupId)) {
		await updateDoc(userRef, {
			groups: arrayUnion(groupId),
		});
	}

	// Add ourselves to the group
	const groupUserRef = doc(db, "groups", groupId, "users", user.uid);

	// Return true if user is already part of the group
	try {
		const userSnap = await getDoc(groupUserRef);
		if (userSnap.exists()) {
			return true;
		}
	} catch {}

	// Join the group
	const groupUserData: GroupUserData = {
		name: user.displayName ?? "Unknown User",
		photoURL: user.photoURL,
		active: true,
		balance: {},
		lastUpdate: Timestamp.now(),
	};
	try {
		await setDoc(groupUserRef, { ...groupUserData, customData: { inviteCode } });

		// If this passes then the user is added to the group so now we remove there custom data
		await updateDoc(groupUserRef, { customData: deleteField() });
	} catch {
		return false;
	}

	return true;
}
