import { getAuth, type User } from "firebase/auth";
import { defineStore, storeToRefs } from "pinia";
import { ref, type Ref } from "vue";

const useCurrentUserStore = defineStore("user", () => {
	const auth = getAuth();

	const currentUser = ref<User | null>(auth.currentUser);
	const currentUserInitialised = ref<boolean>(currentUser !== null);

	auth.onAuthStateChanged((user) => {
		currentUser.value = user;
		if (!user) currentUserInitialised.value = false;
	});

	return { currentUser, currentUserInitialised };
});

// Composable wrapper for the store
export function useCurrentUser(): { currentUser: Ref<User | null>; currentUserInitialised: Ref<boolean> } {
	const { currentUser, currentUserInitialised } = storeToRefs(useCurrentUserStore());
	return { currentUser, currentUserInitialised };
}
