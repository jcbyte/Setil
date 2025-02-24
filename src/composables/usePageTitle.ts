import { inject, onMounted, type Ref } from "vue";
import { useRoute } from "vue-router";

export function usePageTitle(title: null | string = null): void {
	const pageTitle = inject<Ref<string>>("pageTitle");
	const route = useRoute();

	onMounted(() => {
		if (pageTitle) {
			pageTitle.value = title ?? String(route.name);
		}
	});
}
