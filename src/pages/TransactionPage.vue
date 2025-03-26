<script setup lang="ts">
import Avatar from "@/components/Avatar.vue";
import LoaderIcon from "@/components/LoaderIcon.vue";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import YourAccountSettings from "@/components/YourAccountSettings.vue";
import { useCurrentUser } from "@/composables/useCurrentUser";
import { useGroup } from "@/composables/useGroup";
import { createTransaction, updateTransaction } from "@/firebase/firestore/transaction";
import type { Transaction, TransactionCategory } from "@/firebase/types";
import { CategorySettings } from "@/util/category";
import { CurrencySettings, formatCurrency, fromFirestoreAmount, toFirestoreAmount } from "@/util/currency";
import { getLeftUsersInTransaction, getRouteParam, splitAmountEven, splitAmountRatio, sumRecord } from "@/util/util";
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { toTypedSchema } from "@vee-validate/zod";
import { Timestamp } from "firebase/firestore";
import { ArrowLeft, CalendarIcon, Plus, Save } from "lucide-vue-next";
import { toDate } from "reka-ui/date";
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as z from "zod";

const router = useRouter();
const route = useRoute();
const { currentUser } = useCurrentUser();
const { toast } = useToast();

const isTransactionUpdating = ref<boolean>(false);

const routeGroupId = getRouteParam(route.params.groupId);
const routeTransactionId = getRouteParam(route.params.transactionId);

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
			amount: fromFirestoreAmount(sumRecord(transaction.to), groupData.value!.currency),
			category: transaction.category,
			to: {
				type: "ratio",
				// Only include active members (Unless this transaction contains an inactive member)
				people: Object.fromEntries(
					Object.entries(users.value!)
						.filter(
							([userId, user]) => user.status === "active" || transaction.to[userId] || userId === transaction.from
						)
						.map(([userId]) => [userId, { selected: Boolean(transaction.to[userId]), num: transaction.to[userId] }])
				),
			},
		});
	} else {
		setValues({
			date: today(getLocalTimeZone()).toString(),
			from: currentUser.value!.uid,
			category: "expense",
			to: {
				type: "equal",
				// Only include active members
				people: Object.fromEntries(
					Object.entries(users.value!)
						.filter(([, user]) => user.status === "active")
						.map(([userId]) => [userId, { selected: false, num: undefined }])
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
		category: z.string().refine((val) => Object.keys(CategorySettings).includes(val), "Must select a valid category"),
		from: z
			.string()
			.refine((val) => users.value && Object.keys(users.value).includes(val), "Must select a valid member"),
		to: z
			.object({
				type: z.enum(["equal", "unequal", "ratio"]).default("equal"),
				people: z
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
				(v) => v.type === "equal" || !Object.values(v.people).some((vo) => vo.selected && !vo.num),
				"An amount is required for a selected member"
			),
	})
);

const { isFieldDirty, handleSubmit, setValues, values, setFieldValue } = useForm({
	validationSchema: formSchema,
});

function resolveBalances(): Record<string, number> {
	if (!values.to?.people) return {};

	if (values.to.type === "equal") {
		return splitAmountEven(
			toFirestoreAmount(values.amount ?? 0, groupData.value?.currency ?? "gbp"),
			Object.entries(values.to.people)
				.filter(([, userData]) => userData!.selected)
				.map(([userId]) => userId)
		);
	} else if (values.to.type === "unequal") {
		return Object.fromEntries(
			Object.entries(values.to.people)
				.filter(([, userData]) => userData!.selected)
				.map(([userId, userData]) => [userId, toFirestoreAmount(userData!.num!, groupData.value?.currency ?? "gbp")])
		);
	} else if (values.to.type === "ratio") {
		return splitAmountRatio(
			toFirestoreAmount(values.amount ?? 0, groupData.value?.currency ?? "gbp"),
			Object.fromEntries(
				Object.entries(values.to.people)
					.filter(([, userData]) => userData!.selected)
					.map(([userId, userData]) => [userId, userData!.num ?? 0])
			)
		);
	}

	return {};
}

const dateValue = computed({
	get: () => (values.date ? parseDate(values.date) : undefined),
	set: (val) => val,
});

const toValue = computed<Record<string, number>>(resolveBalances);

const allSelected = computed<boolean>(
	() => !Object.values(values.to?.people ?? {}).some((userData) => !userData?.selected)
);

const onSubmit = handleSubmit(async (values) => {
	if (!groupId.value) return;

	isTransactionUpdating.value = true;

	const transaction: Transaction = {
		title: values.title,
		from: values.from,
		date: Timestamp.fromDate(toDate(parseDate(values.date))),
		to: resolveBalances(),
		category: values.category as TransactionCategory,
	};

	const leftUsers = getLeftUsersInTransaction(transaction, users.value!);

	try {
		if (routeTransactionId) {
			await updateTransaction(groupId.value, routeTransactionId, transaction, leftUsers);
			toast({
				title: "Expense Details Updated",
				description: "Your expense got a makeover, and it's ready to slay.",
				duration: 5000,
			});
		} else {
			await createTransaction(groupId.value, transaction, leftUsers);
			toast({ title: "Expense Created", description: "It's on the group's tab.", duration: 5000 });
			// todo send new transaction notification
		}

		router.push({ path: `/group/${routeGroupId}`, query: { tab: "activity" } });
	} catch (e) {
		toast({ title: "Error Saving Expense Details", description: String(e), variant: "destructive", duration: 5000 });
	}

	isTransactionUpdating.value = false;
});
</script>

<template>
	<div class="w-full flex flex-col gap-4 items-center">
		<div class="w-full flex justify-between items-center">
			<div class="flex gap-2 justify-center items-center">
				<Button
					variant="ghost"
					class="size-9"
					@click="router.push({ path: `/group/${routeGroupId}`, query: { tab: 'activity' } })"
				>
					<ArrowLeft class="!size-6" />
				</Button>
				<span class="text-lg font-semibold">{{ routeTransactionId ? "Edit Expense" : "New Expense" }}</span>
			</div>
			<YourAccountSettings />
		</div>

		<div v-if="groupId" class="w-full max-w-[32rem] flex flex-col gap-4">
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
							<FormItem>
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
								<FormItem class="flex-1">
									<FormLabel>Amount</FormLabel>
									<div class="relative items-center">
										<FormControl>
											<Input
												type="number"
												class="pl-6"
												:placeholder="(0).toFixed(CurrencySettings[groupData!.currency].decimals)"
												:step="Math.pow(10, -CurrencySettings[groupData!.currency].decimals)"
												:disabled="isTransactionUpdating || values.to?.type === 'unequal'"
												v-bind="componentField"
											/>
										</FormControl>
										<span class="absolute left-0 inset-y-0 flex items-center justify-center px-2 text-muted-foreground">
											{{ CurrencySettings[groupData!.currency].symbol }}
										</span>
									</div>
									<FormMessage />
								</FormItem>
							</FormField>

							<FormField name="date" :validate-on-blur="!isFieldDirty">
								<FormItem class="flex-1">
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

						<FormField v-slot="{ componentField }" name="category" :validate-on-blur="!isFieldDirty">
							<FormItem>
								<FormLabel>Category</FormLabel>
								<Select v-bind="componentField" :disabled="isTransactionUpdating">
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Expense" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem v-for="(category, categoryId) in CategorySettings" :value="categoryId">
											<div class="flex items-center gap-2">
												<div class="bg-secondary rounded-lg size-6 flex justify-center items-center">
													<component :is="category.icon" class="size-4" />
												</div>
												<span>{{ category.name }}</span>
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						</FormField>

						<FormField v-slot="{ componentField }" name="from" :validate-on-blur="!isFieldDirty">
							<FormItem>
								<FormLabel>Paid By</FormLabel>
								<Select v-bind="componentField" :disabled="isTransactionUpdating">
									<FormControl>
										<SelectTrigger>
											<SelectValue>
												<div v-if="groupId && values.from" class="flex items-center gap-2">
													<Avatar :src="users![values.from].photoURL" :name="users![values.from].name" class="size-6" />
													<span>{{ users![values.from!].name }} </span>
												</div>
											</SelectValue>
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem
											v-if="values.to?.people"
											v-for="userId in Object.keys(values.to?.people)"
											:value="userId"
										>
											<div class="flex items-center gap-2">
												<Avatar
													:src="users?.[userId].photoURL ?? null"
													:name="users?.[userId].name ?? 'Unloaded User'"
													:class="`size-6 ${users?.[userId].status !== 'active' && 'opacity-70'}`"
												/>
												<span :class="`${users?.[userId].status !== 'active' && 'text-muted-foreground'}`">
													{{ users?.[userId].name ?? "Unloaded User" }}
												</span>
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						</FormField>

						<FormField name="to" :validate-on-blur="!isFieldDirty">
							<FormItem>
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
										<div v-for="(userData, userId) in values.to?.people" class="flex items-center gap-2">
											<Checkbox
												:id="`user-${userId}`"
												:model-value="userData?.selected ?? false"
												@update:modelValue="(val) => setFieldValue(`to.people.${userId}.selected`, Boolean(val))"
												:disabled="isTransactionUpdating"
											/>
											<label :for="`user-${userId}`" class="flex justify-center items-center gap-2">
												<Avatar
													:src="users?.[userId].photoURL ?? null"
													:name="users?.[userId].name ?? 'Unloaded User'"
													:class="`size-6 ${users?.[userId].status !== 'active' && 'opacity-70'}`"
												/>
												<span
													:class="`text-sm text-nowrap ${
														users?.[userId].status !== 'active' && 'text-muted-foreground'
													}`"
												>
													{{ users?.[userId].name ?? "Unloaded User" }}
												</span>
											</label>
											<div v-if="values.to?.type !== 'equal'" class="relative items-center">
												<Input
													type="number"
													:class="values.to?.type !== 'ratio' && 'pl-6'"
													:placeholder="values.to?.type !== 'ratio' ? (0).toFixed(CurrencySettings[groupData!.currency].decimals) : '0'"
													:step="Math.pow(10, -CurrencySettings[groupData!.currency].decimals)"
													:model-value="userData?.num"
													@update:modelValue="(val) => setFieldValue(`to.people.${userId}.num`, Number(val))"
													:disabled="isTransactionUpdating || !userData?.selected"
												/>
												<span
													v-if="values.to?.type !== 'ratio'"
													class="absolute left-0 inset-y-0 flex items-center justify-center px-2 text-muted-foreground"
												>
													{{ CurrencySettings[groupData!.currency].symbol }}
												</span>
											</div>
											<span v-if="values.to?.type !== 'unequal'" class="text-sm text-muted-foreground">
												{{ formatCurrency(toValue[userId] ?? 0, groupData?.currency ?? "usd") }}
											</span>
										</div>
									</div>

									<Button
										variant="outline"
										type="button"
										@click="
											() => {
												const targetValue = !allSelected;
												Object.keys(values.to?.people ?? {}).forEach((userId) => {
													setFieldValue(`to.people.${userId}.selected`, targetValue);
												});
											}
										"
									>
										<span>{{ allSelected ? "Deselect All" : "Select All" }}</span>
									</Button>
								</div>
								<FormMessage />
							</FormItem>
						</FormField>
					</div>

					<Button type="submit" :disabled="isTransactionUpdating" class="w-fit place-self-end">
						<LoaderIcon :icon="routeTransactionId ? Save : Plus" :loading="isTransactionUpdating" />
						<span>{{ routeTransactionId ? "Save Changes" : "Add Expense" }}</span>
					</Button>
				</form>
			</div>
		</div>
		<Skeleton v-else class="w-full max-w-[32rem] h-[38rem]" />
	</div>
</template>
