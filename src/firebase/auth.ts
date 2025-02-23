import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import "./firebase";

export const auth = getAuth();

export async function signInWithGoogle() {
	const provider = new GoogleAuthProvider();

	return signInWithPopup(auth, provider);
}

export async function firebaseSignOut() {
	return signOut(auth);
}
