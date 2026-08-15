import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useCreateMedication } from "../hooks/useMedications";
import { colors, radius, spacing } from "../theme/tokens";

export default function MedicationForm() {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [quantityRemaining, setQuantityRemaining] = useState("30");
  const [refillThreshold, setRefillThreshold] = useState("5");
  const createMedication = useCreateMedication();

  const canSubmit = name.trim().length > 0 && dosage.trim().length > 0 && !createMedication.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createMedication.mutate(
      {
        name: name.trim(),
        dosage: dosage.trim(),
        quantityRemaining: Number(quantityRemaining) || 0,
        refillThreshold: Number(refillThreshold) || 5,
      },
      {
        onSuccess: () => {
          setName("");
          setDosage("");
          setQuantityRemaining("30");
          setRefillThreshold("5");
        },
      },
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>New medication</Text>
      <TextInput style={styles.input} placeholder="e.g. Vitamin D" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Dosage, e.g. 1000 IU" placeholderTextColor={colors.textMuted} value={dosage} onChangeText={setDosage} />
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Quantity on hand</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={quantityRemaining}
            onChangeText={setQuantityRemaining}
          />
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Refill at</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={refillThreshold}
            onChangeText={setRefillThreshold}
          />
        </View>
      </View>
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
  row: { flexDirection: "row", gap: 12 },
  rowItem: { flex: 1, gap: 6 },
  button: { backgroundColor: colors.accent, borderRadius: radius.control, paddingVertical: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  error: { color: colors.error, fontSize: 12 },
});
