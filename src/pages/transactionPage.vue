<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { toTypedSchema } from "@vee-validate/zod";
import { CalendarIcon } from "lucide-vue-next";
import { toDate } from "reka-ui/date";
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as z from "zod";
import { useGroup } from "../composables/useGroup";

const router = useRouter();
const route = useRoute();

const isTransactionUpdating = ref<boolean>(false);

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const routeTransactionId = Array.isArray(route.params.transactionId)
	? route.params.transactionId[0]
	: route.params.transactionId || null;

const { groupId, users, transactions } = useGroup(routeGroupId, () => {
	setValues({});
});

const df = new DateFormatter(navigator.language, { dateStyle: "long" });

const formSchema = toTypedSchema(
	z.object({
		title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
		amount: z
			.number()
			.min(0.01, "An amount is required")
			.transform((val) => parseFloat(val.toFixed(2))),
		date: z.string().refine((v) => v, { message: "A date is required" }),
		from: z
			.string()
			.refine((val) => users.value && Object.keys(users.value).includes(val), "Must select a valid member"),
	})
);

const { isFieldDirty, handleSubmit, setValues, values, setFieldValue } = useForm({
	validationSchema: formSchema,
});

const dateValue = computed({
	get: () => (values.date ? parseDate(values.date) : undefined),
	set: (val) => val,
});

const onSubmit = handleSubmit(async (values) => {
	console.log(values);
});

// async function formSubmit({ valid, values }: FormSubmitEvent): Promise<void> {
// 	if (valid) {
// 		updatingTransaction.value = true;

// 		const transaction: Transaction = {
// 			title: values.title,
// 			to: splitAmount(
// 				values.amount * 100,
// 				values.to.map((user: UserOption) => user.id)
// 			),
// 			from: splitAmount(
// 				values.amount * 100,
// 				values.from.map((user: UserOption) => user.id)
// 			),
// 			date: Timestamp.fromDate(values.date),
// 		};

// 		if (routeTransactionId) {
// 			await updateTransaction(groupId.value!, routeTransactionId!, transaction);

// 			toast.add({
// 				severity: "success",
// 				summary: "Transaction updated",
// 				life: 2000,
// 			});
// 		} else {
// 			await createTransaction(groupId.value!, transaction);

// 			toast.add({
// 				severity: "success",
// 				summary: "Transaction created",
// 				life: 2000,
// 			});
// 		}

// 		router.push(`/group/${groupId.value!}/transactions`);
// 		updatingTransaction.value = false;
// 	}
// }
</script>

<template>
	<div class="w-full flex flex-col gap-4 items-center">
		<div class="w-full flex justify-between items-center">
			<div class="flex gap-2 justify-center items-center">
				<Button variant="ghost" class="size-9" @click="router.push(`/group/${routeGroupId}`)">
					<i class="pi pi-arrow-left" />
				</Button>
				<span class="text-lg font-semibold">{{ routeTransactionId ? "Edit Expense" : "New Expense" }}</span>
			</div>
			<YourAccountSettings />
		</div>

		<div class="min-w-[32rem] flex flex-col gap-4">
			<div class="border border-zinc-800 rounded-lg flex flex-col gap-6 p-4">
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Expense Details</span>
					<span class="text-sm text-zinc-400">{{
						routeTransactionId ? "Update details of this expense" : "Add a new expense to your group"
					}}</span>
				</div>

				<form class="flex flex-col gap-4" @submit="onSubmit">
					<div class="flex flex-col gap-2">
						<FormField v-slot="{ componentField }" name="title" :validate-on-blur="!isFieldDirty">
							<FormItem v-auto-animate>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input
										type="text"
										placeholder="What was this expense for?"
										:disabled="isTransactionUpdating"
										v-bind="componentField"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<div class="flex justify-center gap-4">
							<FormField v-slot="{ componentField }" name="amount" :validate-on-blur="!isFieldDirty">
								<FormItem v-auto-animate class="flex-1">
									<FormLabel>Amount</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="0.00"
											:step="0.01"
											:disabled="isTransactionUpdating"
											v-bind="componentField"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>

							<FormField name="date" :validate-on-blur="!isFieldDirty">
								<FormItem class="flex-1" v-auto-animate>
									<FormLabel>Date</FormLabel>
									<Popover>
										<PopoverTrigger as-child>
											<FormControl>
												<Button
													variant="outline"
													:class="`w-full font-normal ${!dateValue && 'text-muted-foreground'}`"
													:disabled="isTransactionUpdating"
												>
													<span>{{ dateValue ? df.format(toDate(dateValue)) : "Pick a date" }}</span>
													<CalendarIcon class="ms-auto h-4 w-4 opacity-50" />
												</Button>
												<input hidden />
											</FormControl>
										</PopoverTrigger>
										<PopoverContent class="w-auto p-0">
											<Calendar
												v-model="dateValue"
												:min-value="new CalendarDate(1900, 1, 1)"
												:max-value="today(getLocalTimeZone())"
												@update:model-value="(v) => setFieldValue('date', v ? v.toString() : undefined)"
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							</FormField>
						</div>

						<FormField v-slot="{ componentField }" name="from" :validate-on-blur="!isFieldDirty">
							<FormItem v-auto-animate>
								<FormLabel>Paid By</FormLabel>
								<FormControl>
									<Select v-bind="componentField" :disabled="isTransactionUpdating">
										<SelectTrigger>
											<SelectValue placeholder="(todo) Default select You" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem v-for="(user, userId) in users" :value="userId">
												{{ user.name }}
											</SelectItem>
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						// todo "Split with"
					</div>

					<Button type="submit" :disabled="isTransactionUpdating" class="w-fit">
						<i
							:class="`pi ${isTransactionUpdating ? 'pi-spin pi-spinner' : routeTransactionId ? 'pi-save' : 'pi-plus'}`"
						/>
						<span>{{ routeTransactionId ? "Save Changes" : "Add Expense" }}</span>
					</Button>
				</form>
			</div>
		</div>
	</div>
</template>
