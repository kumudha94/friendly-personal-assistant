import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardStats({
  completedToday,
  totalHabits,
  longestStreak,
}: {
  completedToday: number;
  totalHabits: number;
  longestStreak: number;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.stat}>
        <Text style={styles.value}>
          {completedToday}/{totalHabits}
        </Text>
        <Text style={styles.label}>done today</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <View style={styles.streakValueRow}>
          <Ionicons name="flame" size={18} color="#f97316" />
          <Text style={styles.value}>{longestStreak}</Text>
        </View>
        <Text style={styles.label}>best streak</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: "#f5f5f7",
    borderRadius: 12,
    padding: 16,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  divider: { width: 1, backgroundColor: "#e5e5e5" },
  value: { fontSize: 20, fontWeight: "700", color: "#111" },
  streakValueRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  label: { fontSize: 12, color: "#999" },
});
