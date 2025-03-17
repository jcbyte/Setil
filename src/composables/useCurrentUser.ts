import { getAuth, type User } from "firebase/auth";
import { defineStore, storeToRefs } from "pinia";
import { ref, type Ref } from "vue";

const useCurrentUserStore = defineStore("user", () => {
	const auth = getAuth();
	const currentUser = ref<User | null>(auth.currentUser);

	auth.onAuthStateChanged((user) => {
		currentUser.value = user;
	});

	return { currentUser };
});

// Composable wrapper for the store
export function useCurrentUser(): { currentUser: Ref<User | null> } {
	const { currentUser } = storeToRefs(useCurrentUserStore());
	return { currentUser };
}
