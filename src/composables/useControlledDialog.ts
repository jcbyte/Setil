import { ref, type Ref } from "vue";

export function useControlledDialog<T = undefined>(
	data?: T
): {
	open: Ref<boolean>;
	processing: Ref<boolean>;
	openDialog: (data?: T) => void;
	startDialogProcessing: () => void;
	finishDialogProcessing: () => void;
	closeDialog: () => void;
	data: Ref<T | undefined>;
} {
	const open = ref<boolean>(false);
	const processing = ref<boolean>(false);
	const dialogData = ref<T | undefined>(data) as Ref<T | undefined>;

	function openDialog(data?: T) {
		processing.value = false;
		if (data) dialogData.value = data;
		open.value = true;
	}

	function startDialogProcessing() {
		processing.value = true;
	}

	function finishDialogProcessing() {
		processing.value = true;
	}

	function closeDialog() {
		open.value = false;
	}

	return {
		open: open,
		processing: processing,
		openDialog,
		startDialogProcessing,
		finishDialogProcessing,
		closeDialog,
		data: dialogData,
	};
}
