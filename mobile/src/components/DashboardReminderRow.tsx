import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Reminder } from "../types";
import { DAY_LABELS } from "../utils/weekday";
import { colors, typography } from "../theme/tokens";

export default function DashboardReminderRow({ reminder }: { reminder: Reminder }) {
  const repeatLabel =
    reminder.repeatDays.length === 0
      ? "One-time"
      : reminder.repeatDays.map((d) => DAY_LABELS[d]).join(", ");

  return (
    <View style={styles.row}>
      <Ionicons name="alarm-outline" size={16} color={colors.accent} />
      <Text style={styles.title} numberOfLines={1}>
        {reminder.title}
      </Text>
      <Text style={styles.meta}>{reminder.time}</Text>
      <Text style={styles.metaSecondary}>{repeatLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  title: { flex: 1, fontSize: typography.body.fontSize, color: colors.textPrimary },
  meta: { fontSize: typography.secondary.fontSize, fontWeight: "600", color: colors.textSecondary },
  metaSecondary: { fontSize: 11, color: colors.textMuted, minWidth: 60, textAlign: "right" },
});
