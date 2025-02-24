import { getAuth } from "firebase/auth";
import { arrayRemove, doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

export interface UserData {
	groups: string[];
}

export interface GroupData {
	name: string;
}

const newUserTemplate: UserData = {
	groups: [],
};

/**
 * Get the user's uid.
 * @returns the user's uid.
 * @throws an error if the user is not signed in.
 */
function getUserId(): string {
	const userUid = getAuth().currentUser?.uid;
	if (!userUid) throw new Error("User not signed in");

	return userUid;
}

/**
 * Initialise the users data area if is does not exist.
 * @returns true if the data was initialised.
 */
export async function initialiseUserData(): Promise<boolean> {
	const userUid = getUserId();

	const ref = doc(db, "users", userUid);
	const docSnap = await getDoc(ref);

	// Do nothing if the user already exists
	if (docSnap.exists()) return false;

	// Create the users data area
	await setDoc(ref, structuredClone(newUserTemplate));
	return true;
}

/**
 * Get a group's general data.
 * @param groupId id of the group.
 * @returns the general data form the group or null if the group cannot be accessed/does not exist.
 */
export async function getGroupData(groupId: string): Promise<GroupData | null> {
	const ref = doc(db, "groups", groupId);
	// If this throws, most likely the user does not have permission to access the group
	const docSnap = await getDoc(ref).catch(() => null);

	// If the group does not exist
	if (!docSnap || !docSnap.exists()) return null;

	return docSnap.data() as GroupData;
}

/**
 * Get a list of the user's groups, including there data.
 * @param removeUnknownGroups if true, groups that the user does not have access to or have been deleted will be removed from the user.
 * @returns a list of the user's groups, including there data.
 * @throws an error if the user does not exist.
 */
export async function getUserGroups(removeUnknownGroups: boolean = true): Promise<({ id: string } & GroupData)[]> {
	const userUid = getUserId();

	const ref = doc(db, "users", userUid);
	const docSnap = await getDoc(ref);
	// Throw if the user data has not been initialised
	if (!docSnap.exists()) throw new Error("User data does not exist");

	const userData = docSnap.data() as UserData;
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
		updateDoc(ref, {
			groups: arrayRemove(...unknownGroups),
		});
	}

	// Filter out null values
	return userGroups.filter((group) => group !== null);
}
