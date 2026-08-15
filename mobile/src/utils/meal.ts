import type { KitchenMealEntry } from "../types";

export type MealSlot = "breakfast" | "lunch" | "dinner";

export const MEAL_SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

// Snack isn't treated as a "next meal" candidate — by the time it's afternoon the
// meaningful next meal is dinner, not a snack slot. Returns null once dinner's own
// window has passed (today's meals are considered done for the day).
export function nextMealSlot(now: Date = new Date()): MealSlot | null {
  const hour = now.getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return null;
}

export function mealLabel(entry: KitchenMealEntry | undefined): string | null {
  if (!entry) return null;
  return entry.recipe?.name ?? entry.recipeNameSnapshot ?? entry.note ?? null;
}
