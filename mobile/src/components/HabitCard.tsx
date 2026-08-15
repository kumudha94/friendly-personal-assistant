import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Habit, HabitLog } from "../types";
import { calculateStreak } from "../utils/streak";
import { todayStr } from "../utils/date";
import WeekGrid from "./WeekGrid";
import { useToggleHabitLog } from "../hooks/useHabitLogs";
import { colors, radius } from "../theme/tokens";

export default function HabitCard({ habit, logs }: { habit: Habit; logs: HabitLog[] }) {
  const toggleLog = useToggleHabitLog();
  const today = todayStr();
  const todayLog = logs.find((l) => l.date === today);
  const completedToday = todayLog?.completed ?? false;
  const streak = calculateStreak(logs);
  const completedDates = new Set(logs.filter((l) => l.completed).map((l) => l.date));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.checkbox, completedToday && styles.checkboxChecked]}
          onPress={() =>
            toggleLog.mutate({ habitId: habit.id, date: today, completed: !completedToday })
          }
        >
          {completedToday && <Ionicons name="checkmark" size={16} color={colors.textPrimary} />}
        </TouchableOpacity>
        <View style={styles.titleGroup}>
          <Text style={styles.name}>{habit.name}</Text>
          <Text style={styles.meta}>
            {habit.frequency} · target {habit.targetCount}
          </Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={14} color={colors.warning} />
          <Text style={styles.streakText}>{streak}</Text>
        </View>
      </View>
      <WeekGrid completedDates={completedDates} />
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
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.accent },
  titleGroup: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  streakText: { fontSize: 13, fontWeight: "600", color: colors.warning },
});
