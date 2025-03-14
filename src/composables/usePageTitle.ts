import { defineStore, storeToRefs } from "pinia";
import { onMounted, ref, type Ref } from "vue";

export interface PageTitle {
	title: string | null;
}

const usePageTitleStore = defineStore("pageTitle", () => {
	const title = ref<PageTitle>({ title: "Setil" });

	return { title };
});

export function usePageTitle(initialTitle: PageTitle | null = null): {
	pageTitle: Ref<PageTitle>;
	setPageTitle: (title: PageTitle) => void;
} {
	const { title: pageTitle } = storeToRefs(usePageTitleStore());

	// Function to update the title dynamically
	function setTitle(title: PageTitle): void {
		console.log(title);

		if (pageTitle) {
			pageTitle.value = title;
		}
	}

	// Initially set the title
	onMounted(() => {
		if (initialTitle) {
			setTitle(initialTitle);
		}
	});

	return { pageTitle, setPageTitle: setTitle };
}
