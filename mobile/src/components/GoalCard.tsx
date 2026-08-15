import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import type { Goal } from "../types";
import { useHabits } from "../hooks/useHabits";
import { useHabitLogs } from "../hooks/useHabitLogs";
import { useDeleteGoal, useUpdateGoal } from "../hooks/useGoals";
import { calculateStreak } from "../utils/streak";
import { colors, radius, spacing } from "../theme/tokens";

export default function GoalCard({ goal }: { goal: Goal }) {
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const habitsQuery = useHabits();
  const logsQuery = useHabitLogs();

  const linkedHabit = habitsQuery.data?.find((h) => h.id === goal.habitId);
  const linkedStreak = linkedHabit
    ? calculateStreak((logsQuery.data ?? []).filter((l) => l.habitId === linkedHabit.id))
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.checkbox, goal.completed && styles.checkboxChecked]}
          onPress={() => updateGoal.mutate({ id: goal.id, patch: { completed: !goal.completed } })}
        >
          {goal.completed && <Ionicons name="checkmark" size={14} color={colors.textPrimary} />}
        </TouchableOpacity>
        <View style={styles.titleGroup}>
          <Text style={[styles.title, goal.completed && styles.titleDone]}>{goal.title}</Text>
          {!!goal.description && <Text style={styles.description}>{goal.description}</Text>}
          <View style={styles.metaRow}>
            {goal.targetDate && (
              <Text style={styles.meta}>Due {format(parseISO(goal.targetDate), "MMM d, yyyy")}</Text>
            )}
            {linkedHabit && (
              <View style={styles.habitBadge}>
                <Ionicons name="checkmark-circle" size={12} color={colors.accent} />
                <Text style={styles.habitBadgeText}>
                  {linkedHabit.name}
                  {linkedStreak ? ` · ${linkedStreak}d streak` : ""}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => deleteGoal.mutate(goal.id)}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: colors.accent },
  titleGroup: { flex: 1, gap: spacing.xs },
  title: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  titleDone: { color: colors.textMuted, textDecorationLine: "line-through" },
  description: { fontSize: 13, color: colors.textSecondary },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: 2 },
  meta: { fontSize: 11, color: colors.textMuted },
  habitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  habitBadgeText: { fontSize: 11, fontWeight: "600", color: colors.accent },
});
