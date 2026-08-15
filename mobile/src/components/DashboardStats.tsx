import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme/tokens";

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
          <Ionicons name="flame" size={18} color={colors.warning} />
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
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  divider: { width: 1, backgroundColor: colors.border },
  value: { fontSize: typography.sectionTitle.fontSize, fontWeight: "700", color: colors.textPrimary },
  streakValueRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  label: { fontSize: typography.caption.fontSize, color: colors.textMuted },
});
