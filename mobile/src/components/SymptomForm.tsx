import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ScaleTapPicker from "./ScaleTapPicker";
import { useCreateSymptomLog } from "../hooks/useMedications";
import { todayStr } from "../utils/date";
import { colors, radius, spacing, typography } from "../theme/tokens";

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
      <TextInput style={styles.input} placeholder="e.g. Headache" placeholderTextColor={colors.textMuted} value={symptom} onChangeText={setSymptom} />
      <ScaleTapPicker label="Severity" value={severity} onChange={setSeverity} />
      <TextInput
        style={styles.input}
        placeholder="Notes (optional)"
        placeholderTextColor={colors.textMuted}
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <TouchableOpacity style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSubmit} disabled={!canSubmit}>
        {createSymptomLog.isPending ? (
          <ActivityIndicator color={colors.textPrimary} />
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
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, gap: 12 },
  heading: { fontSize: typography.body.fontSize, fontWeight: "700", color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  button: { backgroundColor: colors.accent, borderRadius: radius.control, paddingVertical: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  error: { color: colors.error, fontSize: 12 },
});
