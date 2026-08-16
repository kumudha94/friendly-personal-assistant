import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DayPicker from "./DayPicker";
import type { MedicationInterval, WeekDay } from "../types";
import { colors, radius, spacing, typography } from "../theme/tokens";

const INTERVAL_LABELS: Record<MedicationInterval, string> = {
  daily: "Every day",
  weekly: "Weekly",
  every_x_days: "Every X days",
  monthly: "Monthly",
  as_needed: "Take as needed",
};

const INTERVALS: MedicationInterval[] = ["daily", "weekly", "every_x_days", "monthly", "as_needed"];
const DAYS_OF_MONTH = Array.from({ length: 28 }, (_, i) => i + 1);

export type IntervalValue = {
  interval: MedicationInterval;
  intervalDays: number | null;
  repeatDays: WeekDay[];
  daysOfMonth: number[];
};

export default function MedicationIntervalModal({
  visible,
  value,
  onClose,
  onSave,
}: {
  visible: boolean;
  value: IntervalValue;
  onClose: () => void;
  onSave: (value: IntervalValue) => void;
}) {
  const [interval, setInterval] = useState(value.interval);
  const [intervalDays, setIntervalDays] = useState(value.intervalDays ?? 2);
  const [repeatDays, setRepeatDays] = useState(value.repeatDays);
  const [daysOfMonth, setDaysOfMonth] = useState(value.daysOfMonth);

  useEffect(() => {
    if (visible) {
      setInterval(value.interval);
      setIntervalDays(value.intervalDays ?? 2);
      setRepeatDays(value.repeatDays);
      setDaysOfMonth(value.daysOfMonth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const toggleDayOfMonth = (day: number) => {
    setDaysOfMonth((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)));
  };

  const handleSave = () => {
    onSave({ interval, intervalDays: interval === "every_x_days" ? intervalDays : null, repeatDays, daysOfMonth });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Repeat</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.optionList}>
            {INTERVALS.map((option) => {
              const selected = interval === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.optionRow}
                  onPress={() => setInterval(option)}
                >
                  <Text style={styles.optionLabel}>{INTERVAL_LABELS[option]}</Text>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {interval === "weekly" && (
            <View style={styles.subSection}>
              <Text style={styles.subLabel}>Repeat on</Text>
              <DayPicker value={repeatDays} onChange={setRepeatDays} />
            </View>
          )}

          {interval === "every_x_days" && (
            <View style={styles.subSection}>
              <View style={styles.stepperRow}>
                <Text style={styles.subLabel}>Every</Text>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => setIntervalDays((d) => Math.max(2, d - 1))}
                >
                  <Ionicons name="remove" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{intervalDays}</Text>
                <TouchableOpacity style={styles.stepperButton} onPress={() => setIntervalDays((d) => d + 1)}>
                  <Ionicons name="add" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.subLabel}>days</Text>
              </View>
            </View>
          )}

          {interval === "monthly" && (
            <View style={styles.subSection}>
              <Text style={styles.subLabel}>On these days</Text>
              <View style={styles.monthGrid}>
                {DAYS_OF_MONTH.map((day) => {
                  const selected = daysOfMonth.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.monthDay, selected && styles.monthDaySelected]}
                      onPress={() => toggleDayOfMonth(day)}
                    >
                      <Text style={[styles.monthDayText, selected && styles.monthDayTextSelected]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
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
    maxHeight: "85%",
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.textPrimary, fontSize: typography.sectionTitle.fontSize, fontWeight: typography.sectionTitle.fontWeight },
  content: { gap: spacing.md },
  optionList: { borderRadius: radius.card, backgroundColor: colors.surface, overflow: "hidden" },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLabel: { fontSize: 15, color: colors.textPrimary },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  subSection: { gap: spacing.sm },
  subLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: { fontSize: 16, fontWeight: "700", minWidth: 24, textAlign: "center", color: colors.textPrimary },
  monthGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  monthDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  monthDaySelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  monthDayText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  monthDayTextSelected: { color: colors.textPrimary },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.control,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: { color: colors.textPrimary, fontWeight: "600" },
});
