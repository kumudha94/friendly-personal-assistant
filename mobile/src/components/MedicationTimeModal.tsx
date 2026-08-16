import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import type { MedicationTime } from "../types";
import { colors, radius, spacing, typography } from "../theme/tokens";

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function parseTime(value: string): Date {
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export default function MedicationTimeModal({
  visible,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  initial: MedicationTime | null;
  onClose: () => void;
  onSave: (entry: MedicationTime) => void;
  onDelete?: () => void;
}) {
  const [time, setTime] = useState(new Date());
  const [dose, setDose] = useState(1);

  useEffect(() => {
    if (visible) {
      setTime(initial ? parseTime(initial.time) : new Date());
      setDose(initial?.dose ?? 1);
    }
  }, [visible, initial]);

  const handleSave = () => {
    onSave({ time: formatTime(time), dose });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Set time</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <DateTimePicker value={time} mode="time" display="spinner" onChange={(_e, selected) => selected && setTime(selected)} />

        <Text style={styles.label}>Set dose</Text>
        <View style={styles.doseRow}>
          <TouchableOpacity style={styles.doseButton} onPress={() => setDose((d) => Math.max(1, d - 1))}>
            <Ionicons name="remove" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.doseValue}>{dose}</Text>
          <TouchableOpacity style={styles.doseButton} onPress={() => setDose((d) => d + 1)}>
            <Ionicons name="add" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                onDelete();
                onClose();
              }}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: colors.elevatedSurface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.textPrimary, fontSize: typography.sectionTitle.fontSize, fontWeight: typography.sectionTitle.fontWeight },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, textAlign: "center" },
  doseRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.lg },
  doseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  doseValue: { fontSize: 22, fontWeight: "700", color: colors.textPrimary, minWidth: 32, textAlign: "center" },
  actionsRow: { flexDirection: "row", gap: spacing.sm },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.control,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  deleteButtonText: { color: colors.textSecondary, fontWeight: "600" },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.control,
    alignItems: "center",
    backgroundColor: colors.accent,
  },
  saveButtonText: { color: colors.textPrimary, fontWeight: "600" },
});
