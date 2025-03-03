import { defineStore, storeToRefs } from "pinia";
import { onMounted, ref, type Ref } from "vue";

export interface PageTitle {
	title: string | null;
	loading: boolean;
}

const usePageTitleStore = defineStore("pageTitle", () => {
	const title = ref<PageTitle>({ title: "Setil", loading: false });

	return { title };
});

export function usePageTitle(initialTitle: { title: string; loading?: boolean } | null = null): {
	pageTitle: Ref<PageTitle>;
	setPageTitle: (title: string) => void;
} {
	const { title: pageTitle } = storeToRefs(usePageTitleStore());

	// Function to update the title dynamically
	function setTitle(title: string, loading: boolean = false): void {
		if (pageTitle) {
			pageTitle.value = { title, loading };
		}
	}

	// Initially set the title
	onMounted(() => {
		if (initialTitle) {
			setTitle(initialTitle.title, initialTitle.loading);
		}
	});

	return { pageTitle, setPageTitle: setTitle };
}
