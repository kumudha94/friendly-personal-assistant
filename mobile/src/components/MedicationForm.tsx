import { useState } from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { useCreateMedication, useUpdateMedication } from "../hooks/useMedications";
import MedicationIntervalModal, { type IntervalValue } from "./MedicationIntervalModal";
import MedicationTimeModal from "./MedicationTimeModal";
import type { Medication, MedicationTime } from "../types";
import { formatTimeEntry, intervalSummary } from "../utils/medicationSchedule";
import { colors, radius, spacing } from "../theme/tokens";

const DEFAULT_INTERVAL: IntervalValue = { interval: "daily", intervalDays: null, repeatDays: [], daysOfMonth: [] };

export default function MedicationForm({
  medication,
  onDone,
}: {
  medication?: Medication;
  onDone?: () => void;
}) {
  const editing = !!medication;
  const [name, setName] = useState(medication?.name ?? "");
  const [dosage, setDosage] = useState(medication?.dosage ?? "");
  const [reminderEnabled, setReminderEnabled] = useState(medication?.reminderEnabled ?? false);
  const [startDate, setStartDate] = useState(medication?.startDate ? parseISO(medication.startDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [intervalValue, setIntervalValue] = useState<IntervalValue>(
    medication
      ? {
          interval: medication.interval,
          intervalDays: medication.intervalDays,
          repeatDays: medication.repeatDays,
          daysOfMonth: medication.daysOfMonth,
        }
      : DEFAULT_INTERVAL,
  );
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [times, setTimes] = useState<MedicationTime[]>(medication?.times ?? []);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [message, setMessage] = useState(medication?.message ?? "");
  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();
  const isPending = editing ? updateMedication.isPending : createMedication.isPending;

  const asNeeded = intervalValue.interval === "as_needed";
  const canSubmit = name.trim().length > 0 && dosage.trim().length > 0 && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = {
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
    };

    if (editing) {
      updateMedication.mutate({ id: medication.id, patch: payload }, { onSuccess: onDone });
      return;
    }

    createMedication.mutate(payload, {
      onSuccess: () => {
        setName("");
        setDosage("");
        setReminderEnabled(false);
        setStartDate(new Date());
        setIntervalValue(DEFAULT_INTERVAL);
        setTimes([]);
        setMessage("");
      },
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{editing ? "Edit medication" : "New medication"}</Text>
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

      <View style={editing ? styles.editActionsRow : undefined}>
        {editing && (
          <TouchableOpacity style={styles.cancelButton} onPress={onDone} disabled={isPending}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, editing && styles.buttonFlex, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {isPending ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.buttonText}>{editing ? "Save changes" : "Add medication"}</Text>
          )}
        </TouchableOpacity>
      </View>
      {(editing ? updateMedication.isError : createMedication.isError) && (
        <Text style={styles.error}>
          {((editing ? updateMedication.error : createMedication.error) as Error).message}
        </Text>
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
  buttonFlex: { flex: 1 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  editActionsRow: { flexDirection: "row", gap: spacing.sm },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.control,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: { color: colors.textSecondary, fontWeight: "600" },
  error: { color: colors.error, fontSize: 12 },
});
