import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useHabits } from "../hooks/useHabits";
import { useCreateGoal } from "../hooks/useGoals";

export default function GoalForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [habitId, setHabitId] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const habitsQuery = useHabits();
  const createGoal = useCreateGoal();

  const habits = habitsQuery.data ?? [];
  const canSubmit = title.trim().length > 0 && !createGoal.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createGoal.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        habitId,
        targetDate: targetDate ? format(targetDate, "yyyy-MM-dd") : null,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setHabitId(null);
          setTargetDate(null);
        },
      },
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>New goal</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Run a 5k"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Notes (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {habits.length > 0 && (
        <>
          <Text style={styles.label}>Link to a habit (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {habits.map((habit) => {
                const selected = habitId === habit.id;
                return (
                  <TouchableOpacity
                    key={habit.id}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setHabitId(selected ? null : habit.id)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {habit.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </>
      )}

      <Text style={styles.label}>Target date (optional)</Text>
      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateText}>
            {targetDate ? format(targetDate, "MMM d, yyyy") : "No target date"}
          </Text>
        </TouchableOpacity>
        {targetDate && (
          <TouchableOpacity onPress={() => setTargetDate(null)}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      {showPicker && (
        <DateTimePicker
          value={targetDate ?? new Date()}
          mode="date"
          onChange={(_event, selected) => {
            setShowPicker(false);
            if (selected) setTargetDate(selected);
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {createGoal.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add goal</Text>
        )}
      </TouchableOpacity>
      {createGoal.isError && (
        <Text style={styles.error}>{(createGoal.error as Error).message}</Text>
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
  chipRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  chipSelected: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  chipText: { color: "#333", fontSize: 13, fontWeight: "500" },
  chipTextSelected: { color: "#fff" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dateText: { fontSize: 14, fontWeight: "500" },
  clearText: { color: "#dc2626", fontSize: 13, fontWeight: "600" },
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
