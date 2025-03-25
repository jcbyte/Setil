import { getAuth, type User } from "firebase/auth";
import { CollectionReference, DocumentReference, Timestamp, WriteBatch, doc, getDoc } from "firebase/firestore";
import type { GroupUserData } from "../types";

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
 * Update the lastUpdated property of this user and the group.
 * @param groupRef Document of the group to update lastUpdate on.
 * @param batch WriteBatch to add the transactions to.
 */
export function updateGroupUpdateTime(groupRef: DocumentReference, batch: WriteBatch) {
	// Update the time when the current user has last added a transaction
	const user = getUser();
	const thisUserRef = doc(groupRef, "users", user.uid);
	batch.update(thisUserRef, { lastUpdate: Timestamp.now() });

	// Update the last update field for the group
	batch.update(groupRef, { lastUpdate: Timestamp.now() });
}

/**
 * Works out if the user has left the group with credit/debt or they are history.
 * @param userBalance balance of the user to test.
 * @param forceLeft force the user to leave irrespective of what there current status is.
 * @returns the status of the user given they have left the group, null if it doesn't require a change.
 */
export async function getLeftUserStatus(
	groupUserRef: DocumentReference,
	forceLeft: boolean
): Promise<"left" | "history" | null> {
	const groupUserSnap = await getDoc(groupUserRef);
	const groupUser = groupUserSnap.data() as GroupUserData;

	// If the user is active then don't change
	if (!forceLeft && groupUser.status === "active") return null;

	// Check if there is any balance left on this user and calculate correct status
	const status = groupUser.balance === 0 ? "history" : "left";

	// Return new status if it is modified
	return groupUser.status === status ? null : status;
}

/**
 * Add firebase updates to a batch to update users who have left a group to their valid status.
 * @param groupUsersRef Collection to the users in the group.
 * @param batch WriteBatch to add the transactions to.
 * @param leftUsers Array of userId's which have left and status needs to be recalculated.
 */

export async function updateLeftUsersStatus(
	groupUsersRef: CollectionReference,
	batch: WriteBatch,
	leftUsers: string[]
) {
	await Promise.all(
		leftUsers.map(async (userId) => {
			const leftUserRef = doc(groupUsersRef, userId);

			// Check if there status is correct
			const newStatus = await getLeftUserStatus(leftUserRef, false);

			// If the status needs to be changed add this update
			if (newStatus) batch.update(leftUserRef, { status: newStatus });
		})
	);
}
