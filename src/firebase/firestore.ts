import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
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

function getUserId(): string {
	const userUid = getAuth().currentUser?.uid;
	if (!userUid) throw new Error("User not signed in");

	return userUid;
}

export async function initialiseUserData(): Promise<boolean> {
	const userUid = getUserId();

	const ref = doc(db, "users", userUid);
	const docSnap = await getDoc(ref);

	if (docSnap.exists()) return false;

	await setDoc(ref, structuredClone(newUserTemplate));

	return true;
}

export async function getGroupData(groupId: string): Promise<GroupData> {
	const ref = doc(db, "groups", groupId);
	const docSnap = await getDoc(ref);

	if (!docSnap.exists()) throw new Error("Group not found");

	return docSnap.data() as GroupData;
}

export async function getUserGroups(): Promise<({ id: string } & GroupData)[]> {
	const userUid = getUserId();

	const ref = doc(db, "users", userUid);
	const docSnap = await getDoc(ref);

	if (!docSnap.exists()) return [];

	const userData = docSnap.data() as UserData;

	return await Promise.all(userData.groups.map(async (id) => ({ id, name: (await getGroupData(id)).name })));
}
