import {
	arrayRemove,
	collection,
	doc,
	getCountFromServer,
	getDoc,
	getDocs,
	getFirestore,
	limit,
	orderBy,
	query,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { app } from "../firebase";
import type { GroupData, GroupUserData, UserData } from "../types";
import { getUser } from "./util";

const db = getFirestore(app);

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
	await setDoc(userRef, { groups: [], fcmTokens: [] } as UserData);
	return true;
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

					const myselfSnap = await getDoc(doc(groupUsersRef, user.uid));
					const myselfData = myselfSnap.data() as GroupUserData;

					// If we have left or been removed from this group then, add it to the groups to be removed
					if (myselfData.status !== "active") {
						unknownGroups.push(id);
						return null;
					}

					// Get the last 3 active users to display
					const usersCount = await getCountFromServer(groupUsersRef);
					const topUsersQuery = query(groupUsersRef, orderBy("lastUpdate"), limit(3));
					const topUsersSnap = await getDocs(topUsersQuery);

					const data: ExtendedGroupData = {
						...baseGroupData,
						topUsers: topUsersSnap.docs.map((topUserSnap) => topUserSnap.data() as GroupUserData),
						userCount: usersCount.data().count,
						myself: myselfData,
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
