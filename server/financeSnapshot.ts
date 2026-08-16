import { getAccountBalance, getBillsDueThisMonth, type FinanceBillItem } from "./financeDb";
import { getConnection } from "./connections";

export type FinanceSnapshot =
  | { linked: false }
  | { linked: true; email: string; balance: number; totalDue: number; items: FinanceBillItem[] };

export async function getFinanceSnapshot(): Promise<FinanceSnapshot> {
  const link = await getConnection("financetracker");
  if (!link || link.externalUserId == null) {
    return { linked: false };
  }

  const [balance, items] = await Promise.all([
    getAccountBalance(link.externalUserId),
    getBillsDueThisMonth(link.externalUserId),
  ]);

  return {
    linked: true,
    email: link.email,
    balance,
    totalDue: items.reduce((sum, item) => sum + item.amount, 0),
    items,
  };
}
