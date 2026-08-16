const FINANCETRACKER_BASE_URL = "https://financetracker-ckvf.onrender.com";

export type FinanceBillItem = {
  label: string;
  amount: number;
  dueDate: string | null;
  isPaid: boolean;
  status: string;
};

export type FinanceBillCategory = {
  paidCount: number;
  totalCount: number;
  pendingAmount: number;
  items: FinanceBillItem[];
};

export type FinanceBillsSummary = {
  cycleLabel: string;
  categories: {
    scheduledPayments: FinanceBillCategory;
    creditCardBills: FinanceBillCategory;
    loans: FinanceBillCategory;
    insurance: FinanceBillCategory;
  };
};

function mapCategory(raw: any): FinanceBillCategory {
  return {
    paidCount: raw.paidCount,
    totalCount: raw.totalCount,
    pendingAmount: raw.pendingAmount,
    items: raw.items.map((item: any) => ({
      label: item.name,
      amount: item.amount,
      dueDate: item.dueDate,
      isPaid: item.isPaid,
      status: item.status,
    })),
  };
}

// Calls FinanceTracker's own current-cycle bills computation (salary-cycle-aware, correct
// overdue handling) instead of Milo re-deriving "what's due this month" itself against raw
// tables — see the /api/integrations/milo/bills-summary route in FinanceTracker for why.
export async function getBillsSummary(userId: number): Promise<FinanceBillsSummary> {
  const headers: Record<string, string> = {};
  if (process.env.FINANCE_INTEGRATION_KEY) {
    headers["X-Milo-Api-Key"] = process.env.FINANCE_INTEGRATION_KEY;
  }

  const res = await fetch(`${FINANCETRACKER_BASE_URL}/api/integrations/milo/bills-summary?userId=${userId}`, {
    headers,
  });
  if (!res.ok) {
    const body: any = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Bills summary lookup failed with ${res.status}`);
  }
  const data: any = await res.json();

  return {
    cycleLabel: data.cycleLabel,
    categories: {
      scheduledPayments: mapCategory(data.categories.scheduledPayments),
      creditCardBills: mapCategory(data.categories.creditCardBills),
      loans: mapCategory(data.categories.loans),
      insurance: mapCategory(data.categories.insurance),
    },
  };
}
