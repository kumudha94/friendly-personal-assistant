import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Habit, HabitLog } from "../types";
import { calculateStreak } from "../utils/streak";
import { todayStr } from "../utils/date";
import { useToggleHabitLog } from "../hooks/useHabitLogs";

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
        {completedToday && <Ionicons name="checkmark" size={14} color="#fff" />}
      </TouchableOpacity>
      <Text style={[styles.name, completedToday && styles.nameDone]} numberOfLines={1}>
        {habit.name}
      </Text>
      {streak > 0 && (
        <View style={styles.streak}>
          <Ionicons name="flame" size={12} color="#f97316" />
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
    borderColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#4f46e5" },
  name: { flex: 1, fontSize: 14, color: "#111" },
  nameDone: { color: "#999", textDecorationLine: "line-through" },
  streak: { flexDirection: "row", alignItems: "center", gap: 2 },
  streakText: { fontSize: 12, fontWeight: "600", color: "#f97316" },
});
