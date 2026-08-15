import { neon } from "@neondatabase/serverless";

// Read-only access to FinanceTracker's own Neon DB. Every query in this file must be a
// SELECT — this connection uses FinanceTracker's own DATABASE_URL (full read/write access),
// so the read-only guarantee here is a code-level discipline, not a DB-enforced one.
function getFinanceSql() {
  if (!process.env.FINANCE_DATABASE_URL) {
    throw new Error("FINANCE_DATABASE_URL is not configured on this server.");
  }
  return neon(process.env.FINANCE_DATABASE_URL);
}

export async function findFinanceUserIdByEmail(email: string): Promise<number | null> {
  const sql = getFinanceSql();
  const rows = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  return rows.length > 0 ? Number(rows[0].id) : null;
}

export async function getAccountBalance(userId: number): Promise<number> {
  const sql = getFinanceSql();
  const rows = await sql`
    SELECT COALESCE(SUM(balance), 0) AS total
    FROM accounts
    WHERE user_id = ${userId} AND type IN ('bank', 'wallet')
  `;
  return Number(rows[0]?.total ?? 0);
}

export type FinanceBillItem = {
  label: string;
  amount: number;
  dueDate: string;
  kind: "bill" | "insurance" | "loan";
};

export async function getBillsDueThisMonth(userId: number): Promise<FinanceBillItem[]> {
  const sql = getFinanceSql();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [bills, insurance, loans] = await Promise.all([
    sql`
      SELECT sp.name AS label, po.amount AS occurrence_amount, sp.amount AS scheduled_amount, po.due_date
      FROM payment_occurrences po
      JOIN scheduled_payments sp ON sp.id = po.scheduled_payment_id
      WHERE sp.user_id = ${userId} AND po.month = ${month} AND po.year = ${year} AND po.status = 'pending'
    `,
    sql`
      SELECT i.name AS label, ip.amount, ip.due_date
      FROM insurance_premiums ip
      JOIN insurances i ON i.id = ip.insurance_id
      WHERE i.user_id = ${userId}
        AND ip.status != 'paid'
        AND EXTRACT(MONTH FROM ip.due_date) = ${month}
        AND EXTRACT(YEAR FROM ip.due_date) = ${year}
    `,
    sql`
      SELECT l.name AS label, li.emi_amount AS amount, li.due_date
      FROM loan_installments li
      JOIN loans l ON l.id = li.loan_id
      WHERE l.user_id = ${userId}
        AND li.status = 'pending'
        AND EXTRACT(MONTH FROM li.due_date) = ${month}
        AND EXTRACT(YEAR FROM li.due_date) = ${year}
    `,
  ]);

  const items: FinanceBillItem[] = [
    ...bills.map((r: any) => ({
      label: String(r.label),
      amount: Number(r.occurrence_amount ?? r.scheduled_amount ?? 0),
      dueDate: new Date(r.due_date).toISOString().slice(0, 10),
      kind: "bill" as const,
    })),
    ...insurance.map((r: any) => ({
      label: String(r.label),
      amount: Number(r.amount ?? 0),
      dueDate: new Date(r.due_date).toISOString().slice(0, 10),
      kind: "insurance" as const,
    })),
    ...loans.map((r: any) => ({
      label: String(r.label),
      amount: Number(r.amount ?? 0),
      dueDate: new Date(r.due_date).toISOString().slice(0, 10),
      kind: "loan" as const,
    })),
  ];

  return items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
