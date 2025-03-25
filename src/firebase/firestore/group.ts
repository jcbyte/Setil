import {
	addDoc,
	arrayUnion,
	collection,
	deleteDoc,
	deleteField,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	limit,
	query,
	setDoc,
	Timestamp,
	updateDoc,
	where,
} from "firebase/firestore";
import { app } from "../firebase";
import type { GroupData, GroupUserData, Invite, UserData } from "../types";
import { getLeftUserStatus, getUser } from "./util";

const db = getFirestore(app);

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
		status: "active",
		balance: 0,
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
			// Set ourselves to active in the group if we had previously been part of it
			const userGroupData = userSnap.data() as GroupUserData;
			if (userGroupData.status !== "active") updateDoc(groupUserRef, { status: "active" });

			return true;
		}
	} catch {}

	// Join the group
	const groupUserData: GroupUserData = {
		name: user.displayName ?? "Unknown User",
		photoURL: user.photoURL,
		status: "active",
		balance: 0,
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

/**
 * Remove a user from a group.
 * @param groupId id of the group.
 * @param userId id of the user to remove.
 */
export async function removeUser(groupId: string, userId: string) {
	const groupUserRef = doc(db, "groups", groupId, "users", userId);

	// Get the status of the user when not in the group
	const status = await getLeftUserStatus(groupUserRef, true);

	// If the status needs to be changed then do this
	if (status) await updateDoc(groupUserRef, { status: status });
}

/**
 * Change a users name within a group.
 * @param groupId id of the group.
 * @param userId id of the user to update name.
 * @param name new name to give to the user.
 */
export async function changeUserName(groupId: string, userId: string, name: string) {
	const groupUserRef = doc(db, "groups", groupId, "users", userId);

	// Update the name of the user in the group
	await updateDoc(groupUserRef, { name });
}

/**
 * Set a groups owner to a different user.
 * @param groupId id of the group.
 * @param userId id of the user to promote.
 */
export async function promoteUser(groupId: string, userId: string) {
	const groupRef = doc(db, "groups", groupId);

	// Update the owner of the the group
	await updateDoc(groupRef, { owner: userId });
}

/**
 * User leaves the group, passing on ownership if required.
 * @param groupId id of the group.
 */
export async function leaveGroup(groupId: string) {
	const user = getUser();

	// If user is owner then pass this to a different user
	const groupRef = doc(db, "groups", groupId);
	const groupDocSnap = await getDoc(groupRef);
	const groupData = groupDocSnap.data() as GroupData;

	if (groupData.owner === user.uid) {
		// Find an active owner
		const firestoreUsersRef = collection(db, "groups", groupId, "users");
		const activeUserQuery = query(firestoreUsersRef, where("status", "==", "active"), limit(2));
		const userSnaps = await getDocs(activeUserQuery);

		// Exclude ourselves if we are found as the next possible owner
		const possibleOwners = userSnaps.docs.filter((doc) => doc.id !== user.uid).map((doc) => doc.id);

		if (possibleOwners.length === 0) {
			// Delete the group if the are no active users left
			await deleteGroup(groupId);
		} else {
			// Set the owner to the new owner found
			await updateDoc(groupRef, { owner: possibleOwners[0] });
		}
	}

	// Set the users status to show they have left
	const groupUserRef = doc(db, "groups", groupId, "users", user.uid);
	const newStatus = await getLeftUserStatus(groupUserRef, true);
	if (newStatus) await updateDoc(groupUserRef, { status: newStatus });
}
