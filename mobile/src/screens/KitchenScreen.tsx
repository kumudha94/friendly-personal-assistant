import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useKitchenSnapshot } from "../hooks/useKitchen";
import EmptyState from "../components/EmptyState";
import { navigate } from "../navigation/navigationRef";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";
import { todayStr } from "../utils/date";
import { MEAL_SLOT_LABEL, mealLabel, nextMealSlot, type MealSlot } from "../utils/meal";
import type { KitchenMealEntry } from "../types";

const SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"];

const SLOT_ICON: Record<MealSlot, keyof typeof Ionicons.glyphMap> = {
  breakfast: "sunny-outline",
  lunch: "partly-sunny-outline",
  dinner: "moon-outline",
};

function MealRow({ slot, entry, isNext }: { slot: MealSlot; entry: KitchenMealEntry | undefined; isNext: boolean }) {
  const label = mealLabel(entry);
  return (
    <View style={[styles.mealCard, isNext && styles.mealCardNext]}>
      <View style={styles.mealHeader}>
        <Ionicons name={SLOT_ICON[slot]} size={18} color={isNext ? colors.accent : colors.textMuted} />
        <Text style={styles.mealSlot}>{MEAL_SLOT_LABEL[slot]}</Text>
        {isNext && <Text style={styles.nextBadge}>NEXT</Text>}
      </View>

      {label ? (
        <>
          <Text style={styles.mealName}>{label}</Text>
          {entry?.recipe && (
            <View style={styles.recipeDetail}>
              {entry.recipe.prepTimeMinutes != null && (
                <Text style={styles.recipeMeta}>
                  {entry.recipe.prepTimeMinutes} min · {entry.recipe.servings} servings
                </Text>
              )}
              {entry.recipe.ingredients.length > 0 && (
                <Text style={styles.ingredients}>
                  {entry.recipe.ingredients.map((i) => `${i.name} (${i.quantity})`).join(", ")}
                </Text>
              )}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.mealEmpty}>Nothing planned yet</Text>
      )}
    </View>
  );
}

export default function KitchenScreen() {
  const today = todayStr();
  const snapshotQuery = useKitchenSnapshot(today);

  if (snapshotQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const snapshot = snapshotQuery.data;

  if (snapshotQuery.isError || !snapshot || !("meals" in snapshot)) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Not connected"
          subtitle="Connect KitchenPlanner from Connected Apps to see today's meal plan here."
          actionLabel="Go to Connected Apps"
          onAction={() => navigate("More", { screen: "ConnectedApps" })}
        />
      </View>
    );
  }

  const slot = nextMealSlot();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.dateHeading}>{format(new Date(), "EEEE, MMM d")}</Text>
      <View style={styles.mealList}>
        {SLOTS.map((s) => (
          <MealRow key={s} slot={s} entry={snapshot.meals.find((m) => m.slot === s)} isNext={s === slot} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: spacing.md },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  dateHeading: { color: colors.textPrimary, fontSize: typography.screenTitle.fontSize, fontWeight: "700" },
  mealList: { gap: spacing.sm },
  mealCard: {
    padding: spacing.sm + 6,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  mealCardNext: { borderColor: colors.accent },
  mealHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  mealSlot: { fontSize: typography.body.fontSize, fontWeight: "700", color: colors.textPrimary, flex: 1 },
  nextBadge: {
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    color: colors.accent,
    letterSpacing: 0.5,
  },
  mealName: { fontSize: typography.body.fontSize, color: colors.textPrimary },
  mealEmpty: { fontSize: typography.secondary.fontSize, color: colors.textMuted },
  recipeDetail: { gap: 2, marginTop: 2 },
  recipeMeta: { fontSize: typography.caption.fontSize, color: colors.textMuted },
  ingredients: { fontSize: typography.caption.fontSize, color: colors.textSecondary, lineHeight: 17 },
});
