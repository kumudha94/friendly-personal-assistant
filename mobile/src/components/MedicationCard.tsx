import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Medication, MedicationLog } from "../types";
import { useDeleteMedication, useSetMedicationLog } from "../hooks/useMedications";
import { todayStr } from "../utils/date";
import { intervalSummary, timesSummary } from "../utils/medicationSchedule";
import { colors, radius } from "../theme/tokens";
import MedicationForm from "./MedicationForm";

export default function MedicationCard({ medication, logs }: { medication: Medication; logs: MedicationLog[] }) {
  const setMedicationLog = useSetMedicationLog();
  const deleteMedication = useDeleteMedication();
  const [editing, setEditing] = useState(false);
  const today = todayStr();
  const takenToday = logs.find((l) => l.date === today)?.taken ?? false;

  const handleToggle = () => {
    setMedicationLog.mutate({ medicationId: medication.id, date: today, taken: !takenToday });
  };

  if (editing) {
    return <MedicationForm medication={medication} onDone={() => setEditing(false)} />;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={() => setEditing(true)} activeOpacity={0.8}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={[styles.checkbox, takenToday && styles.checkboxChecked]} onPress={handleToggle}>
          {takenToday && <Ionicons name="checkmark" size={14} color={colors.textPrimary} />}
        </TouchableOpacity>
        <View style={styles.titleGroup}>
          <Text style={styles.name}>{medication.name}</Text>
          <Text style={styles.meta}>{medication.dosage}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteMedication.mutate(medication.id)}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.footerRow}>
        <Ionicons
          name={medication.reminderEnabled ? "notifications" : "notifications-off-outline"}
          size={13}
          color={medication.reminderEnabled ? colors.accent : colors.textMuted}
        />
        <Text style={styles.scheduleText}>
          {intervalSummary(medication)}
          {medication.interval !== "as_needed" && medication.times.length > 0 ? ` · ${timesSummary(medication.times)}` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  titleGroup: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scheduleText: { fontSize: 12, color: colors.textMuted, flex: 1 },
});
