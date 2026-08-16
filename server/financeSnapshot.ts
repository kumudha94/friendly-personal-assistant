import { getAccountBalance } from "./financeDb";
import { getBillsSummary, type FinanceBillCategory } from "./financeApi";
import { getConnection } from "./connections";

export type FinanceSnapshot =
  | { linked: false }
  | {
      linked: true;
      email: string;
      balance: number;
      cycleLabel: string;
      totalDue: number;
      categories: {
        scheduledPayments: FinanceBillCategory;
        creditCardBills: FinanceBillCategory;
        loans: FinanceBillCategory;
        insurance: FinanceBillCategory;
      };
    };

export async function getFinanceSnapshot(): Promise<FinanceSnapshot> {
  const link = await getConnection("financetracker");
  if (!link || link.externalUserId == null) {
    return { linked: false };
  }

  const [balance, billsSummary] = await Promise.all([
    getAccountBalance(link.externalUserId),
    getBillsSummary(link.externalUserId),
  ]);

  const { categories } = billsSummary;
  const totalDue = Object.values(categories).reduce((sum, c) => sum + c.pendingAmount, 0);

  return {
    linked: true,
    email: link.email,
    balance,
    cycleLabel: billsSummary.cycleLabel,
    totalDue,
    categories,
  };
}
