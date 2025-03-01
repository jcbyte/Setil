import { inject, onMounted, type Ref } from "vue";

export function usePageTitle(title: null | string = null): (title: string) => void {
	const pageTitle = inject<Ref<{ title: string; loading: boolean }>>("pageTitle");

	// Initially set the title
	onMounted(() => {
		if (pageTitle) {
			pageTitle.value = { title: title ?? "", loading: title === null };
		}
	});

	// Function to update the title dynamically
	const setTitle = (title: string, loading: boolean = false) => {
		if (pageTitle) {
			pageTitle.value = { title, loading };
		}
	};

	return setTitle;
}
