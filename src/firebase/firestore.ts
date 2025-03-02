import { getAuth, type User } from "firebase/auth";
import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	increment,
	orderBy,
	query,
	setDoc,
	updateDoc,
	writeBatch,
} from "firebase/firestore";
import { app } from "./firebase";
import type { GroupData, GroupUserData, Transaction, UserData } from "./types";

const db = getFirestore(app);

/**
 * Get the user's uid.
 * @returns the user's uid.
 * @throws an error if the user is not signed in.
 */
function getUser(): User {
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
 * Get a group's general data.
 * @param groupId id of the group.
 * @returns the general data form the group or null if the group cannot be accessed/does not exist.
 */
export async function getGroupData(groupId: string): Promise<GroupData | null> {
	const groupRef = doc(db, "groups", groupId);
	// If this throws, most likely the user does not have permission to access the group
	const groupDocSnap = await getDoc(groupRef).catch(() => null);

	// If the group does not exist
	if (!groupDocSnap || !groupDocSnap.exists()) return null;

	return groupDocSnap.data() as GroupData;
}

/**
 * Get a list of the user's groups, including there data.
 * @param removeUnknownGroups if true, groups that the user does not have access to or have been deleted will be removed from the user.
 * @returns a list of the user's groups, including there data.
 * @throws an error if the user does not exist.
 */
export async function getUserGroups(removeUnknownGroups: boolean = true): Promise<Record<string, GroupData>> {
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
					const data = await getGroupData(id);
					// If the group cannot be found, add it to the unknown groups list to be removed later
					if (!data) {
						unknownGroups.push(id);
						return null;
					}

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
	const groupUserData: GroupUserData = { name: user.displayName ?? "Unknown User", balance: {} };
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
 * Get all transactions from a group.
 * @param groupId id of the group.
 * @returns the list of transactions in the group.
 */
export async function getTransactions(groupId: string): Promise<Record<string, Transaction>> {
	const transactionsRef = collection(db, "groups", groupId, "transactions");

	// Get all transaction docs ordered by date
	const q = query(transactionsRef, orderBy("date", "desc"));
	const querySnap = await getDocs(q);

	return Object.fromEntries(querySnap.docs.map((doc) => [doc.id, doc.data() as Transaction]));
}

/**
 * Get all users from a group.
 * @param groupId id of the group.
 * @returns the list of users and related data in the group.
 */
export async function getUsers(groupId: string): Promise<Record<string, GroupUserData>> {
	const usersRef = collection(db, "groups", groupId, "users");

	// Get all users in the group
	const usersSnap = await getDocs(usersRef);

	return Object.fromEntries(usersSnap.docs.map((doc) => [doc.id, doc.data() as GroupUserData]));
}

function calculateDeltas(
	from: Record<string, number>,
	to: Record<string, number>
): Record<string, Record<string, number>> {
	// Work out the changes in balances for each user based on the transaction
	const balancesDelta: Record<string, Record<string, number>> = {};
	const totalPaid = Object.values(to).reduce((a, b) => a + b, 0);

	for (const payerId in from) {
		const amountPaid = from[payerId];

		for (const receiverId in to) {
			const amountReceived = to[receiverId];

			// Rounding to fix fix floating point errors
			const amountOwed = Math.round((amountPaid * amountReceived) / totalPaid);

			// Ensure keys exist
			if (!balancesDelta[payerId]) balancesDelta[payerId] = {};
			if (!balancesDelta[payerId][receiverId]) balancesDelta[payerId][receiverId] = 0;
			if (!balancesDelta[receiverId]) balancesDelta[receiverId] = {};
			if (!balancesDelta[receiverId][payerId]) balancesDelta[receiverId][payerId] = 0;

			// Update deltas
			balancesDelta[payerId][receiverId] += amountOwed;
			balancesDelta[receiverId][payerId] -= amountOwed;
		}
	}

	return balancesDelta;
}

/**
 * Create a transaction in a group and update relevant users balances.
 * @param groupId id of the group.
 * @param transaction transaction data.
 * @returns the id of the new transaction.
 */
export async function createTransaction(groupId: string, transaction: Transaction): Promise<string> {
	// Add the transaction to the group
	const groupTransactionsRef = collection(db, "groups", groupId, "transactions");
	const transactionRef = await addDoc(groupTransactionsRef, transaction);

	// Work out the changes in balances for each user based on the transaction
	const balancesDelta = calculateDeltas(transaction.from, transaction.to);

	// Update balances in firestore
	const batch = writeBatch(db);
	Object.entries(balancesDelta).forEach(([userId, balanceDelta]) => {
		const userRef = doc(db, "groups", groupId, "users", userId);
		batch.update(
			userRef,
			Object.fromEntries(
				Object.entries(balanceDelta).map(([userId2, amount]) => [`balance.${userId2}`, increment(amount)])
			)
		);
	});
	await batch.commit();

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
	// Get the existing transaction data
	const transactionRef = doc(db, "groups", groupId, "transactions", transactionId);
	const transactionSnap = await getDoc(transactionRef);
	const oldTransaction = transactionSnap.data() as Transaction;

	// Update the transaction to the group
	await setDoc(transactionRef, transaction);

	// Work out the original and new changes in balances for each user based on the transaction
	const oldBalancesDelta = calculateDeltas(oldTransaction.from, oldTransaction.to);
	const balancesDelta = calculateDeltas(transaction.from, transaction.to);

	// Calculate balancesDelta delta
	for (const userId in oldBalancesDelta) {
		if (!balancesDelta[userId]) balancesDelta[userId] = {};

		for (const receiverId in oldBalancesDelta[userId]) {
			if (!balancesDelta[userId][receiverId]) balancesDelta[userId][receiverId] = 0;

			balancesDelta[userId][receiverId] -= oldBalancesDelta[userId][receiverId];
		}
	}

	// Update balances in firestore
	const batch = writeBatch(db);
	Object.entries(balancesDelta).forEach(([userId, balanceDelta]) => {
		const userRef = doc(db, "groups", groupId, "users", userId);
		batch.update(
			userRef,
			Object.fromEntries(
				Object.entries(balanceDelta).map(([userId2, amount]) => [`balance.${userId2}`, increment(amount)])
			)
		);
	});
	await batch.commit();
}

/**
 * Delete a transaction in a group and update relevant users balances.
 * @param groupId id of the group.
 * @param transactionId id of the transaction.
 */
export async function deleteTransaction(groupId: string, transactionId: string): Promise<void> {
	// Get the existing transaction data
	const transactionRef = doc(db, "groups", groupId, "transactions", transactionId);
	const transactionSnap = await getDoc(transactionRef);
	const transaction = transactionSnap.data() as Transaction;

	// Delete the transaction from the group
	await deleteDoc(transactionRef);

	// Work out the changes in balances for each user based on the transaction
	const balancesDelta = calculateDeltas(transaction.from, transaction.to);

	// Update balances in firestore
	const batch = writeBatch(db);
	Object.entries(balancesDelta).forEach(([userId, balanceDelta]) => {
		const userRef = doc(db, "groups", groupId, "users", userId);
		batch.update(
			userRef,
			Object.fromEntries(
				// Invert the amount as we removing the transaction
				Object.entries(balanceDelta).map(([userId2, amount]) => [`balance.${userId2}`, increment(-amount)])
			)
		);
	});
	await batch.commit();
}
