import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ScaleTapPicker from "./ScaleTapPicker";
import { useCreateSymptomLog } from "../hooks/useMedications";
import { todayStr } from "../utils/date";

export default function SymptomForm() {
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState("");
  const createSymptomLog = useCreateSymptomLog();

  const canSubmit = symptom.trim().length > 0 && !createSymptomLog.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createSymptomLog.mutate(
      { date: todayStr(), symptom: symptom.trim(), severity, notes: notes.trim() || null },
      {
        onSuccess: () => {
          setSymptom("");
          setSeverity(3);
          setNotes("");
        },
      },
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Log a symptom</Text>
      <TextInput style={styles.input} placeholder="e.g. Headache" value={symptom} onChangeText={setSymptom} />
      <ScaleTapPicker label="Severity" value={severity} onChange={setSeverity} />
      <TextInput
        style={styles.input}
        placeholder="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <TouchableOpacity style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSubmit} disabled={!canSubmit}>
        {createSymptomLog.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log symptom</Text>
        )}
      </TouchableOpacity>
      {createSymptomLog.isError && (
        <Text style={styles.error}>{(createSymptomLog.error as Error).message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, backgroundColor: "#f5f5f7", gap: 12 },
  heading: { fontSize: 16, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  button: { backgroundColor: "#4f46e5", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 12 },
});
