import { neon } from "@neondatabase/serverless";

// Read-only access to KitchenPlanner's own Neon DB. Every query in this file must be a
// SELECT — this connection uses KitchenPlanner's own DATABASE_URL (full read/write access),
// so the read-only guarantee here is a code-level discipline, not a DB-enforced one.
// Unlike FinanceTracker, KitchenPlanner is single-tenant (no user_id column on its tables),
// so there's no OTP/email linking step — just a configured/not-configured check.
function getKitchenSql() {
  if (!process.env.KITCHEN_DATABASE_URL) {
    throw new Error("KITCHEN_DATABASE_URL is not configured on this server.");
  }
  return neon(process.env.KITCHEN_DATABASE_URL);
}

export type KitchenMealSlot = "breakfast" | "lunch" | "snack" | "dinner";

export type KitchenRecipe = {
  id: number;
  name: string;
  ingredients: { name: string; quantity: string }[];
  prepTimeMinutes: number | null;
  servings: number;
};

export type KitchenMealEntry = {
  slot: KitchenMealSlot;
  note: string | null;
  recipeNameSnapshot: string | null;
  recipe: KitchenRecipe | null;
};

export type KitchenSnapshot =
  | { configured: false }
  | { configured: true; date: string; meals: KitchenMealEntry[] };

export async function getKitchenSnapshot(date: string): Promise<KitchenSnapshot> {
  if (!process.env.KITCHEN_DATABASE_URL) {
    return { configured: false };
  }

  const sql = getKitchenSql();
  const rows = await sql`
    SELECT mpe.slot, mpe.note, mpe.recipe_name_snapshot,
           r.id AS recipe_id, r.name AS recipe_name, r.ingredients, r.prep_time_minutes, r.servings
    FROM meal_plan_entries mpe
    LEFT JOIN recipes r ON r.id = mpe.recipe_id
    WHERE mpe.date = ${date}
  `;

  const meals: KitchenMealEntry[] = rows.map((row: any) => ({
    slot: row.slot as KitchenMealSlot,
    note: row.note ?? null,
    recipeNameSnapshot: row.recipe_name_snapshot ?? null,
    recipe: row.recipe_id
      ? {
          id: Number(row.recipe_id),
          name: String(row.recipe_name),
          ingredients: row.ingredients ?? [],
          prepTimeMinutes: row.prep_time_minutes ?? null,
          servings: Number(row.servings ?? 4),
        }
      : null,
  }));

  return { configured: true, date, meals };
}
