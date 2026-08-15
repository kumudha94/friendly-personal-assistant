import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DayPicker from "./DayPicker";
import type { WeekDay } from "../types";
import { useCreateReminder } from "../hooks/useReminders";

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
          <ActivityIndicator color="#fff" />
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
  card: { padding: 16, borderRadius: 12, backgroundColor: "#f5f5f7", gap: 12 },
  label: { fontSize: 13, fontWeight: "600", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  timeButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  timeText: { fontSize: 16, fontWeight: "600" },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 12 },
});
