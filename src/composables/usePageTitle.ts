import { inject, onMounted, type Ref } from "vue";

export interface PageTitle {
	title: string;
	loading: boolean;
}

export function usePageTitle(title: null | string): (title: string) => void {
	const pageTitle = inject<Ref<PageTitle>>("pageTitle");

	// Initially set the title
	onMounted(() => {
		if (pageTitle) {
			// If no title is provided then use the route name
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
