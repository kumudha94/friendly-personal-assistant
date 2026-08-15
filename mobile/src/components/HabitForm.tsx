import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import FrequencyPicker from "./FrequencyPicker";
import type { Frequency } from "../types";
import { useCreateHabit } from "../hooks/useHabits";

export default function HabitForm() {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [targetCount, setTargetCount] = useState("1");
  const createHabit = useCreateHabit();

  const canSubmit = name.trim().length > 0 && !createHabit.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createHabit.mutate(
      { name: name.trim(), frequency, targetCount: Number(targetCount) || 1 },
      {
        onSuccess: () => {
          setName("");
          setFrequency("daily");
          setTargetCount("1");
        },
      },
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>New habit</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Drink water"
        value={name}
        onChangeText={setName}
      />
      <FrequencyPicker value={frequency} onChange={setFrequency} />
      <View style={styles.targetRow}>
        <Text style={styles.label}>Target per day</Text>
        <TextInput
          style={styles.targetInput}
          keyboardType="number-pad"
          value={targetCount}
          onChangeText={setTargetCount}
        />
      </View>
      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {createHabit.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add habit</Text>
        )}
      </TouchableOpacity>
      {createHabit.isError && (
        <Text style={styles.error}>{(createHabit.error as Error).message}</Text>
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
  targetRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  targetInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 64,
    textAlign: "center",
    backgroundColor: "#fff",
  },
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
