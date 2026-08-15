import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Reminder } from "../types";
import { DAY_LABELS } from "../utils/weekday";

export default function DashboardReminderRow({ reminder }: { reminder: Reminder }) {
  const repeatLabel =
    reminder.repeatDays.length === 0
      ? "One-time"
      : reminder.repeatDays.map((d) => DAY_LABELS[d]).join(", ");

  return (
    <View style={styles.row}>
      <Ionicons name="alarm-outline" size={16} color="#4f46e5" />
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
  title: { flex: 1, fontSize: 14, color: "#111" },
  meta: { fontSize: 13, fontWeight: "600", color: "#333" },
  metaSecondary: { fontSize: 11, color: "#999", minWidth: 60, textAlign: "right" },
});
