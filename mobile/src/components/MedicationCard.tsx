import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Medication, MedicationLog } from "../types";
import { useDeleteMedication, useSetMedicationLog } from "../hooks/useMedications";
import { todayStr } from "../utils/date";
import { colors, radius } from "../theme/tokens";

export default function MedicationCard({ medication, logs }: { medication: Medication; logs: MedicationLog[] }) {
  const setMedicationLog = useSetMedicationLog();
  const deleteMedication = useDeleteMedication();
  const today = todayStr();
  const takenToday = logs.find((l) => l.date === today)?.taken ?? false;
  const lowSupply = medication.quantityRemaining <= medication.refillThreshold;

  const handleToggle = () => {
    setMedicationLog.mutate(
      { medicationId: medication.id, date: today, taken: !takenToday },
      {
        onSuccess: ({ medication: updated }) => {
          if (!takenToday && updated.quantityRemaining <= updated.refillThreshold) {
            Alert.alert(
              "Refill needed",
              `${updated.name} is down to ${updated.quantityRemaining} left — time to refill.`,
            );
          }
        },
      },
    );
  };

  return (
    <View style={styles.card}>
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
        <Text style={styles.quantityText}>{medication.quantityRemaining} remaining</Text>
        {lowSupply && (
          <View style={styles.lowSupplyBadge}>
            <Ionicons name="alert-circle" size={12} color={colors.error} />
            <Text style={styles.lowSupplyText}>Refill soon</Text>
          </View>
        )}
      </View>
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
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  quantityText: { fontSize: 12, color: colors.textMuted },
  lowSupplyBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  lowSupplyText: { fontSize: 11, fontWeight: "600", color: colors.error },
});
