<script setup lang="ts">
import LoaderIcon from "@/components/LoaderIcon.vue";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { toTypedSchema } from "@vee-validate/zod";
import { ArrowLeft, Save } from "lucide-vue-next";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as z from "zod";

const router = useRouter();
const route = useRoute();
const { toast } = useToast();

const isDetailsUpdating = ref<boolean>(false);

const formSchema = toTypedSchema(
	z.object({
		name: z.string(),
		sortCode: z.string(),
		accountNumber: z.string(),
	})
);

const { isFieldDirty, handleSubmit, setValues } = useForm({
	validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
	isDetailsUpdating.value = true;

	try {
		// Update details

		toast({ title: "Details Updated", description: "todo some quirky description.", duration: 5000 });
	} catch (e) {
		toast({ title: "Error Updating Details", description: String(e), variant: "destructive", duration: 5000 });
	}

	isDetailsUpdating.value = false;
});
</script>

<template>
	<div>
		<div class="w-full flex flex-col gap-4 items-center">
			<div class="w-full flex justify-between items-center">
				<div class="flex gap-2 justify-center items-center">
					<Button variant="ghost" class="size-9" @click="router.back()">
						<ArrowLeft class="!size-6" />
					</Button>
					<span class="text-lg font-semibold">User Settings</span>
				</div>
				<YourAccountSettings />
			</div>

			<div class="w-full max-w-[32rem] flex flex-col gap-4">
				<div class="border border-border rounded-lg flex flex-col gap-6 p-4">
					<div class="flex flex-col">
						<span class="text-lg font-semibold">Payment Details</span>
						<span class="text-sm text-muted-foreground">How you want people to pay you</span>
					</div>

					<form class="flex flex-col gap-4" @submit="onSubmit">
						<div class="flex flex-col gap-2">
							<FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											autocomplete="off"
											type="text"
											placeholder="John Smith"
											:disabled="isDetailsUpdating"
											v-bind="componentField"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>

							<FormField v-slot="{ componentField }" name="sortCode" :validate-on-blur="!isFieldDirty">
								<FormItem>
									<FormLabel>Sort Code</FormLabel>
									<FormControl>
										<Input
											autocomplete="off"
											type="text"
											placeholder="00-00-00"
											:disabled="isDetailsUpdating"
											v-bind="componentField"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>

							<FormField v-slot="{ componentField }" name="accountNumber" :validate-on-blur="!isFieldDirty">
								<FormItem>
									<FormLabel>Account Number</FormLabel>
									<FormControl>
										<Input
											autocomplete="off"
											type="text"
											placeholder="00000000"
											:disabled="isDetailsUpdating"
											v-bind="componentField"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>
						</div>

						<Button type="submit" :disabled="isDetailsUpdating" class="w-fit place-self-end">
							<LoaderIcon :icon="Save" :loading="isDetailsUpdating" />
							<span>Save</span>
						</Button>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>
