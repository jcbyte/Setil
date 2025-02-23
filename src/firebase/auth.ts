import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import "./firebase";

export async function signInWithGoogle() {
	const provider = new GoogleAuthProvider();

	return signInWithPopup(getAuth(), provider);
}

export async function firebaseSignOut() {
	return signOut(getAuth());
}
