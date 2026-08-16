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

// "What's due" no longer lives here — it moved to financeApi.ts, which calls FinanceTracker's
// own /api/integrations/milo/bills-summary endpoint instead of re-deriving cycle/status rules
// against these raw tables (see that endpoint's comment for why the old direct-SQL version was
// wrong). Balance is a simple, unambiguous sum with no business logic to get wrong, so it stays
// a direct read here.
export async function getAccountBalance(userId: number): Promise<number> {
  const sql = getFinanceSql();
  const rows = await sql`
    SELECT COALESCE(SUM(balance), 0) AS total
    FROM accounts
    WHERE user_id = ${userId} AND type IN ('bank', 'wallet')
  `;
  return Number(rows[0]?.total ?? 0);
}
