import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DayPicker from "./DayPicker";
import type { WeekDay } from "../types";
import { useCreateReminder } from "../hooks/useReminders";
import { colors, radius, spacing } from "../theme/tokens";

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function ReminderForm() {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [repeatDays, setRepeatDays] = useState<WeekDay[]>([]);
  const createReminder = useCreateReminder();

  const canSubmit = title.trim().length > 0 && !createReminder.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createReminder.mutate(
      { title: title.trim(), time: formatTime(time), repeatDays },
      {
        onSuccess: () => {
          setTitle("");
          setTime(new Date());
          setRepeatDays([]);
        },
      },
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>New reminder</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Take medication"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      <TouchableOpacity style={styles.timeButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.timeText}>{formatTime(time)}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour
          onChange={(_event, selected) => {
            setShowPicker(false);
            if (selected) setTime(selected);
          }}
        />
      )}

      <Text style={styles.label}>Repeat (leave blank for a one-time reminder)</Text>
      <DayPicker value={repeatDays} onChange={setRepeatDays} />

      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {createReminder.isPending ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Add reminder</Text>
        )}
      </TouchableOpacity>
      {createReminder.isError && (
        <Text style={styles.error}>{(createReminder.error as Error).message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, gap: 12 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  timeText: { fontSize: 16, fontWeight: "600", color: colors.textPrimary },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.control,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  error: { color: colors.error, fontSize: 12 },
});
