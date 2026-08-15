import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Reminder, WeekDay } from "../types";
import { useDeleteReminder, useUpdateReminder } from "../hooks/useReminders";
import { snoozeReminder } from "../lib/notifications";

const DAY_LABELS: Record<WeekDay, string> = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

export default function ReminderCard({ reminder }: { reminder: Reminder }) {
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();

  const repeatLabel =
    reminder.repeatDays.length === 0
      ? "One-time"
      : reminder.repeatDays.map((d) => DAY_LABELS[d]).join(", ");

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{reminder.title}</Text>
          <Text style={styles.meta}>
            {reminder.time} · {repeatLabel}
          </Text>
        </View>
        <Switch
          value={reminder.active}
          onValueChange={(active) => updateReminder.mutate({ id: reminder.id, patch: { active } })}
        />
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={async () => {
            await snoozeReminder(reminder, 10);
            Alert.alert("Snoozed", `"${reminder.title}" will remind you again in 10 minutes.`);
          }}
        >
          <Ionicons name="time-outline" size={16} color="#4f46e5" />
          <Text style={styles.actionText}>Snooze 10m</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteReminder.mutate(reminder.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
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
    gap: 10,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleGroup: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 12, color: "#999", marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 16 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { fontSize: 12, fontWeight: "600", color: "#4f46e5" },
  deleteText: { color: "#dc2626" },
});
