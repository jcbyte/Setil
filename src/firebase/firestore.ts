import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { DEFAULT_USER_DATA, type UserData } from "../types";
import { app } from "./firebase";

const db = getFirestore(app);

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

	await setDoc(ref, structuredClone(DEFAULT_USER_DATA));

	return true;
}

export interface UserGroup {
	id: string;
	name: string;
}
export async function getUserGroups(): Promise<UserGroup[]> {
	const userUid = getUserId();

	const ref = doc(db, "users", userUid);
	const docSnap = await getDoc(ref);

	if (!docSnap.exists()) return [];

	const userData = docSnap.data() as UserData;

	// todo get group name
	return userData.groups.map((id) => ({ id, name: "name" + id }));
}
