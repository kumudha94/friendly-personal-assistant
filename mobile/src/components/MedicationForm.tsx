import { useState } from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useCreateMedication } from "../hooks/useMedications";
import MedicationIntervalModal, { type IntervalValue } from "./MedicationIntervalModal";
import MedicationTimeModal from "./MedicationTimeModal";
import type { MedicationTime } from "../types";
import { formatTimeEntry, intervalSummary } from "../utils/medicationSchedule";
import { colors, radius, spacing } from "../theme/tokens";

const DEFAULT_INTERVAL: IntervalValue = { interval: "daily", intervalDays: null, repeatDays: [], daysOfMonth: [] };

export default function MedicationForm() {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [intervalValue, setIntervalValue] = useState<IntervalValue>(DEFAULT_INTERVAL);
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [times, setTimes] = useState<MedicationTime[]>([]);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [message, setMessage] = useState("");
  const createMedication = useCreateMedication();

  const asNeeded = intervalValue.interval === "as_needed";
  const canSubmit = name.trim().length > 0 && dosage.trim().length > 0 && !createMedication.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createMedication.mutate(
      {
        name: name.trim(),
        dosage: dosage.trim(),
        active: true,
        reminderEnabled: asNeeded ? false : reminderEnabled,
        startDate: format(startDate, "yyyy-MM-dd"),
        interval: intervalValue.interval,
        intervalDays: intervalValue.intervalDays,
        repeatDays: intervalValue.repeatDays,
        daysOfMonth: intervalValue.daysOfMonth,
        times: asNeeded ? [] : times,
        message: message.trim() || null,
      },
      {
        onSuccess: () => {
          setName("");
          setDosage("");
          setReminderEnabled(false);
          setStartDate(new Date());
          setIntervalValue(DEFAULT_INTERVAL);
          setTimes([]);
          setMessage("");
        },
      },
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>New medication</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Vitamin D"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Dosage, e.g. 1000 IU"
        placeholderTextColor={colors.textMuted}
        value={dosage}
        onChangeText={setDosage}
      />

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Reminder</Text>
        <Switch value={asNeeded ? false : reminderEnabled} onValueChange={setReminderEnabled} disabled={asNeeded} />
      </View>

      <Text style={styles.sectionLabel}>Schedule</Text>
      <TouchableOpacity style={styles.pickerRow} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.rowLabel}>Start date</Text>
        <Text style={styles.pickerValue}>{format(startDate, "MMM d, yyyy")}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(_e, selected) => {
            setShowDatePicker(false);
            if (selected) setStartDate(selected);
          }}
        />
      )}

      <TouchableOpacity style={styles.pickerRow} onPress={() => setShowIntervalModal(true)}>
        <Text style={styles.rowLabel}>Interval</Text>
        <Text style={styles.pickerValue}>{intervalSummary(intervalValue)}</Text>
      </TouchableOpacity>

      {!asNeeded && (
        <>
          <View style={styles.timeDoseHeader}>
            <Text style={styles.sectionLabel}>Time & dose</Text>
            <TouchableOpacity
              style={styles.addTimeButton}
              onPress={() => {
                setEditingTimeIndex(null);
                setShowTimeModal(true);
              }}
            >
              <Ionicons name="add" size={16} color={colors.accent} />
              <Text style={styles.addTimeText}>Add</Text>
            </TouchableOpacity>
          </View>
          {times.length === 0 ? (
            <Text style={styles.emptyTimesText}>No times added yet.</Text>
          ) : (
            times.map((entry, index) => (
              <TouchableOpacity
                key={`${entry.time}-${index}`}
                style={styles.timeRow}
                onPress={() => {
                  setEditingTimeIndex(index);
                  setShowTimeModal(true);
                }}
              >
                <Text style={styles.timeRowText}>{formatTimeEntry(entry)}</Text>
                <Ionicons name="pencil-outline" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </>
      )}

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={styles.input}
        placeholder={`Time to take ${name.trim() || "your medication"}`}
        placeholderTextColor={colors.textMuted}
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSubmit} disabled={!canSubmit}>
        {createMedication.isPending ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Add medication</Text>
        )}
      </TouchableOpacity>
      {createMedication.isError && (
        <Text style={styles.error}>{(createMedication.error as Error).message}</Text>
      )}

      <MedicationIntervalModal
        visible={showIntervalModal}
        value={intervalValue}
        onClose={() => setShowIntervalModal(false)}
        onSave={setIntervalValue}
      />
      <MedicationTimeModal
        visible={showTimeModal}
        initial={editingTimeIndex !== null ? times[editingTimeIndex] : null}
        onClose={() => setShowTimeModal(false)}
        onSave={(entry) => {
          setTimes((prev) => {
            if (editingTimeIndex !== null) {
              const next = [...prev];
              next[editingTimeIndex] = entry;
              return next;
            }
            return [...prev, entry];
          });
        }}
        onDelete={
          editingTimeIndex !== null
            ? () => setTimes((prev) => prev.filter((_, i) => i !== editingTimeIndex))
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, gap: 12 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: colors.textPrimary, marginTop: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.control,
    backgroundColor: colors.elevatedSurface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerValue: { fontSize: 13, fontWeight: "600", color: colors.accent },
  timeDoseHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xs },
  addTimeButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  addTimeText: { fontSize: 13, fontWeight: "600", color: colors.accent },
  emptyTimesText: { fontSize: 12, color: colors.textMuted },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.control,
    backgroundColor: colors.elevatedSurface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeRowText: { fontSize: 13, color: colors.textPrimary },
  button: { backgroundColor: colors.accent, borderRadius: radius.control, paddingVertical: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  error: { color: colors.error, fontSize: 12 },
});
