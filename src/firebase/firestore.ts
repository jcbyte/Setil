import { getAuth, type User } from "firebase/auth";
import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	orderBy,
	query,
	setDoc,
	Timestamp,
	updateDoc,
} from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

export interface UserData {
	groups: string[];
}

export interface GroupData {
	name: string;
	owner: string;
}

export interface GroupUserData {
	name: string;
}

export interface Transaction {
	title: string;
	amount: number;
	from: string[];
	to: string[];
	date: Timestamp;
}

const newUserTemplate: UserData = {
	groups: [],
};

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
export async function getUserGroups(removeUnknownGroups: boolean = true): Promise<({ id: string } & GroupData)[]> {
	const user = getUser();

	const userRef = doc(db, "users", user.uid);
	const userDocSnap = await getDoc(userRef);
	// Throw if the user data has not been initialised
	if (!userDocSnap.exists()) throw new Error("User data does not exist");

	const userData = userDocSnap.data() as UserData;
	let unknownGroups: string[] = [];

	// Get the data for each group
	const userGroups = await Promise.all(
		userData.groups.map(async (id) => {
			const data = await getGroupData(id);
			// If the group cannot be found, add it to the unknown groups list to be removed later
			if (!data) {
				unknownGroups.push(id);
				return null;
			}

			return { id, ...data };
		})
	);

	// Remove unknown groups from the user's data if required
	if (removeUnknownGroups && unknownGroups.length > 0) {
		updateDoc(userRef, {
			groups: arrayRemove(...unknownGroups),
		});
	}

	// Filter out null values
	return userGroups.filter((group) => group !== null);
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
	const groupUserData: GroupUserData = { name: user.displayName ?? "Unknown User" };
	await setDoc(groupUsersRef, groupUserData);

	// Add the group to the user
	const userRef = doc(db, "users", user.uid);
	await updateDoc(userRef, {
		groups: arrayUnion(groupRef.id),
	});

	return groupRef.id;
}

/**
 * Get all transactions from a group.
 * @param groupId id of the group.
 * @returns the list of transactions in the group.
 */
export async function getTransactions(groupId: string): Promise<Transaction[]> {
	const transactionsRef = collection(db, "groups", groupId, "transactions");

	// Get all transaction docs ordered by date
	const q = query(transactionsRef, orderBy("date"));
	const querySnap = await getDocs(q);

	return querySnap.docs.map((doc) => doc.data() as Transaction);
}
