import type { TransactionCategory } from "@/firebase/types";
import { ReceiptText, Wallet, type LucideProps } from "lucide-vue-next";
import type { FunctionalComponent } from "vue";

export interface CategoryData {
	name: string;
	icon: FunctionalComponent<LucideProps, {}, any, {}>;
}

export const CategorySettings: Record<TransactionCategory, CategoryData> = {
	expense: { name: "Expense", icon: ReceiptText },
	payment: { name: "Payment", icon: Wallet },
};
