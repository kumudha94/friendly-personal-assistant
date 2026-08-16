import { getAccounts, type FinanceAccount } from "./financeDb";
import { getBillsSummary, type FinanceBillCategory } from "./financeApi";
import { getConnection } from "./connections";

export type FinanceSnapshot =
  | { linked: false }
  | {
      linked: true;
      email: string;
      balance: number;
      accounts: FinanceAccount[];
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

  const [accounts, billsSummary] = await Promise.all([
    getAccounts(link.externalUserId),
    getBillsSummary(link.externalUserId),
  ]);

  const { categories } = billsSummary;
  const totalDue = Object.values(categories).reduce((sum, c) => sum + c.pendingAmount, 0);
  const balance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return {
    linked: true,
    email: link.email,
    balance,
    accounts,
    cycleLabel: billsSummary.cycleLabel,
    totalDue,
    categories,
  };
}
