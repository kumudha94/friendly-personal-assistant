import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import type { Goal } from "../types";
import { useHabits } from "../hooks/useHabits";
import { useHabitLogs } from "../hooks/useHabitLogs";
import { useDeleteGoal, useUpdateGoal } from "../hooks/useGoals";
import { calculateStreak } from "../utils/streak";

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
          {goal.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
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
                <Ionicons name="checkmark-circle" size={12} color="#4f46e5" />
                <Text style={styles.habitBadgeText}>
                  {linkedHabit.name}
                  {linkedStreak ? ` · ${linkedStreak}d streak` : ""}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => deleteGoal.mutate(goal.id)}>
          <Ionicons name="trash-outline" size={18} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: "#4f46e5" },
  titleGroup: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: "600" },
  titleDone: { color: "#999", textDecorationLine: "line-through" },
  description: { fontSize: 13, color: "#666" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
  meta: { fontSize: 11, color: "#999" },
  habitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  habitBadgeText: { fontSize: 11, fontWeight: "600", color: "#4f46e5" },
});
