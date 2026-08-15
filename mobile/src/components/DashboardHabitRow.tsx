import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Habit, HabitLog } from "../types";
import { calculateStreak } from "../utils/streak";
import { todayStr } from "../utils/date";
import { useToggleHabitLog } from "../hooks/useHabitLogs";
import { colors, typography } from "../theme/tokens";

export default function DashboardHabitRow({ habit, logs }: { habit: Habit; logs: HabitLog[] }) {
  const toggleLog = useToggleHabitLog();
  const today = todayStr();
  const completedToday = logs.find((l) => l.date === today)?.completed ?? false;
  const streak = calculateStreak(logs);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.checkbox, completedToday && styles.checkboxChecked]}
        onPress={() =>
          toggleLog.mutate({ habitId: habit.id, date: today, completed: !completedToday })
        }
      >
        {completedToday && <Ionicons name="checkmark" size={14} color={colors.textPrimary} />}
      </TouchableOpacity>
      <Text style={[styles.name, completedToday && styles.nameDone]} numberOfLines={1}>
        {habit.name}
      </Text>
      {streak > 0 && (
        <View style={styles.streak}>
          <Ionicons name="flame" size={12} color={colors.warning} />
          <Text style={styles.streakText}>{streak}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.accent },
  name: { flex: 1, fontSize: typography.body.fontSize, color: colors.textPrimary },
  nameDone: { color: colors.textMuted, textDecorationLine: "line-through" },
  streak: { flexDirection: "row", alignItems: "center", gap: 2 },
  streakText: { fontSize: typography.caption.fontSize, fontWeight: "600", color: colors.warning },
});
