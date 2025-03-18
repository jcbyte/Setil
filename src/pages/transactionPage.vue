<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { useCurrentUser } from "@/composables/useCurrentUser";
import { createTransaction, updateTransaction } from "@/firebase/firestore";
import type { Transaction } from "@/firebase/types";
import { CurrencySettings } from "@/util/groupSettings";
import { formatCurrency, resolveBalance, splitAmountEven, splitAmountRatio } from "@/util/util";
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { toTypedSchema } from "@vee-validate/zod";
import { Timestamp } from "firebase/firestore";
import { CalendarIcon } from "lucide-vue-next";
import { toDate } from "reka-ui/date";
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as z from "zod";
import { useGroup } from "../composables/useGroup";

const router = useRouter();
const route = useRoute();
const { currentUser } = useCurrentUser();

const isTransactionUpdating = ref<boolean>(false);

const routeGroupId = Array.isArray(route.params.groupId) ? route.params.groupId[0] : route.params.groupId || null;
const routeTransactionId = Array.isArray(route.params.transactionId)
	? route.params.transactionId[0]
	: route.params.transactionId || null;

const { groupId, groupData, users, transactions } = useGroup(routeGroupId, () => {
	if (!groupId.value) return;

	if (routeTransactionId) {
		const transaction = transactions.value![routeTransactionId];

		const transactionDate = transaction.date.toDate();
		const transactionCalendarDate = new CalendarDate(
			transactionDate.getFullYear(),
			transactionDate.getMonth() + 1,
			transactionDate.getDate()
		);

		setValues({
			title: transaction.title,
			date: transactionCalendarDate.toString(),
			from: transaction.from,
			amount: resolveBalance(transaction.to),
			to: {
				type: "ratio",
				selected: Object.fromEntries(
					Object.keys(users.value!).map((userId) => {
						const toBal = transaction.to[userId];
						return [userId, { selected: !!toBal, num: toBal ?? undefined }];
					})
				),
			},
		});
	} else {
		setValues({
			date: today(getLocalTimeZone()).toString(),
			from: currentUser.value!.uid,
			to: {
				type: "equal",
				selected: Object.fromEntries(
					Object.keys(users.value!).map((userId) => [userId, { selected: false, num: undefined }])
				),
			},
		});
	}
});

const df = new DateFormatter(navigator.language, { dateStyle: "long" });

const formSchema = toTypedSchema(
	z.object({
		title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
		amount: z // Must do all validation within refine, as we require no validation when values.to === "unequal"
			.any()
			.optional()
			.refine((val) => {
				if (values.to?.type === "unequal") return true;
				return val && typeof val === "number" && val > 0;
			}, "An amount is required"),
		date: z.string().refine((v) => v, { message: "A date is required" }),
		from: z
			.string()
			.refine((val) => users.value && Object.keys(users.value).includes(val), "Must select a valid member"),
		to: z
			.object({
				type: z.enum(["equal", "unequal", "ratio"]).default("equal"),
				selected: z
					.record(
						z.string(),
						z.object({
							selected: z.boolean(),
							num: z.number().optional(),
						})
					)
					.refine((v) => Object.values(v).some((vo) => vo.selected), "Must select at least one recipient"),
			})
			.refine(
				(v) => v.type === "equal" || !Object.values(v.selected).some((vo) => vo.selected && !vo.num),
				"An amount is required for a selected member"
			),
	})
);

const { isFieldDirty, handleSubmit, setValues, values, setFieldValue } = useForm({
	validationSchema: formSchema,
});

const dateValue = computed({
	get: () => (values.date ? parseDate(values.date) : undefined),
	set: (val) => val,
});

function resolveBalances(): Record<string, number> {
	if (!values.to?.selected) return {};

	if (values.to.type === "equal") {
		return splitAmountEven(
			values.amount ?? 0,
			Object.entries(values.to.selected)
				.filter(([, selectedData]) => selectedData!.selected)
				.map(([userId]) => userId)
		);
	} else if (values.to.type === "unequal") {
		return Object.fromEntries(
			Object.entries(values.to.selected)
				.filter(([, selectedData]) => selectedData!.selected)
				.map(([userId, selectedData]) => [userId, selectedData!.num!])
		);
	} else if (values.to.type === "ratio") {
		return splitAmountRatio(
			values.amount ?? 0,
			Object.fromEntries(
				Object.entries(values.to.selected)
					.filter(([, selectedData]) => selectedData!.selected)
					.map(([userId, selectedData]) => [userId, selectedData!.num ?? 0])
			)
		);
	}

	return {};
}

const toValue = computed<Record<string, number>>(resolveBalances);

const onSubmit = handleSubmit(async (values) => {
	if (!groupId.value) return;

	isTransactionUpdating.value = true;

	const transaction: Transaction = {
		title: values.title,
		from: values.from,
		date: Timestamp.fromDate(toDate(parseDate(values.date))),
		to: resolveBalances(),
	};

	if (routeTransactionId) {
		await updateTransaction(groupId.value, routeTransactionId, transaction);
	} else {
		await createTransaction(groupId.value, transaction);
	}

	router.push(`/group/${groupId.value}`);
	isTransactionUpdating.value = false;
});
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

		<div v-if="groupId" class="min-w-[32rem] flex flex-col gap-4">
			<div class="border border-border rounded-lg flex flex-col gap-6 p-4">
				<div class="flex flex-col">
					<span class="text-lg font-semibold">Expense Details</span>
					<span class="text-sm text-muted-foreground">{{
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
										<div class="relative items-center">
											<Input
												type="number"
												class="pl-6"
												placeholder="0.00"
												:step="0.01"
												:disabled="isTransactionUpdating || values.to?.type === 'unequal'"
												v-bind="componentField"
											/>
											<span
												class="absolute left-0 inset-y-0 flex items-center justify-center px-2 text-muted-foreground"
											>
												{{ CurrencySettings[groupData!.currency].symbol }}
											</span>
										</div>
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
											<SelectValue>
												<div v-if="groupId && values.from" class="flex items-center gap-2">
													<Avatar :src="users![values.from].photoURL" :name="users![values.from].name" class="size-6" />
													<span>{{ users![values.from!].name }} </span>
												</div>
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											<SelectItem v-for="(user, userId) in users" :value="userId">
												<div class="flex items-center gap-2">
													<Avatar :src="user.photoURL" :name="user.name" class="size-5" />
													<span>{{ user.name }} </span>
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<FormField name="to" :validate-on-blur="!isFieldDirty">
							<FormItem v-auto-animate>
								<FormLabel>Split with</FormLabel>
								<div class="flex flex-col gap-2 border border-border rounded-lg p-2">
									<Tabs
										:model-value="values.to?.type"
										@update:modelValue="(val) => setFieldValue('to.type', val as 'equal'|'unequal'|'ratio')"
									>
										<TabsList class="grid w-full grid-cols-3">
											<TabsTrigger value="equal" :disabled="isTransactionUpdating"> Equal </TabsTrigger>
											<TabsTrigger value="unequal" :disabled="isTransactionUpdating"> Unequal </TabsTrigger>
											<TabsTrigger value="ratio" :disabled="isTransactionUpdating"> Ratio </TabsTrigger>
										</TabsList>
									</Tabs>

									<div class="flex flex-col gap-2">
										<div v-for="(user, userId) in users" class="flex justify-between items-center">
											<div class="flex justify-center items-center gap-2">
												<Checkbox
													:id="`user-${userId}`"
													:model-value="values.to?.selected?.[userId]?.selected ?? false"
													@update:modelValue="(val) => setFieldValue(`to.selected.${userId}.selected`, Boolean(val))"
													:disabled="isTransactionUpdating"
												/>
												<label :for="`user-${userId}`" class="flex justify-center items-center gap-2">
													<Avatar :src="user.photoURL ?? ''" :name="user.name" class="size-6" />
													<span class="text-sm text-nowrap">{{ user.name }}</span>
												</label>
												<div v-if="values.to?.type !== 'equal'" class="relative items-center">
													<Input
														type="number"
														:class="values.to?.type !== 'ratio' && 'pl-6'"
														:placeholder="values.to?.type !== 'ratio' ? '0.00' : '0'"
														:step="0.01"
														:model-value="values.to?.selected?.[userId]?.num"
														@update:modelValue="(val) => setFieldValue(`to.selected.${userId}.num`, Number(val))"
														:disabled="isTransactionUpdating || !values.to?.selected?.[userId]?.selected"
													/>
													<span
														v-if="values.to?.type !== 'ratio'"
														class="absolute left-0 inset-y-0 flex items-center justify-center px-2 text-muted-foreground"
													>
														{{ CurrencySettings[groupData!.currency].symbol }}
													</span>
												</div>
											</div>
											<span v-if="values.to?.type !== 'unequal'" class="text-sm text-muted-foreground">
												{{ formatCurrency(toValue[userId] ?? 0, groupData?.currency ?? "usd") }}
											</span>
										</div>
									</div>
								</div>
								<FormMessage />
							</FormItem>
						</FormField>
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
		<Skeleton v-else class="w-[32rem] h-[38rem]" />
	</div>
</template>
