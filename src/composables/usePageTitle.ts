import { inject, onMounted, type Ref } from "vue";
import { useRoute } from "vue-router";

export function usePageTitle(title: null | string = null): (title: string) => void {
	const pageTitle = inject<Ref<string>>("pageTitle");
	const route = useRoute();

	// Initially set the title
	onMounted(() => {
		if (pageTitle) {
			// If no title is provided then use the route name
			pageTitle.value = title ?? String(route.name);
		}
	});

	// Function to update the title dynamically
	const setTitle = (title: string) => {
		if (pageTitle) {
			pageTitle.value = title;
		}
	};

	return setTitle;
}
