import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuickAdd } from "../hooks/useQuickAdd";
import type { QuickAddResult } from "../types";

const EXAMPLES = [
  "remind me to call mom at 6pm",
  "start a daily habit to stretch every morning",
  "goal: read 12 books this year",
];

function describeResult(result: QuickAddResult): string {
  if (result.type === "reminder") {
    return `Reminder "${result.item.title}" at ${result.item.time}${
      result.item.repeatDays.length ? ` (repeats ${result.item.repeatDays.join(", ")})` : ""
    }`;
  }
  if (result.type === "habit") {
    return `Habit "${result.item.name}" (${result.item.frequency})`;
  }
  return `Goal "${result.item.title}"${result.item.targetDate ? ` — due ${result.item.targetDate}` : ""}`;
}

export default function QuickAddScreen() {
  const [text, setText] = useState("");
  const quickAdd = useQuickAdd();

  const canSubmit = text.trim().length > 0 && !quickAdd.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    quickAdd.mutate(text.trim(), { onSuccess: () => setText("") });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Quick add</Text>
      <Text style={styles.subheading}>
        Describe a reminder, habit, or goal in plain English — Claude figures out which and fills
        it in.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. remind me to call mom at 6"
        value={text}
        onChangeText={setText}
        multiline
      />

      <TouchableOpacity style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSubmit} disabled={!canSubmit}>
        {quickAdd.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add</Text>}
      </TouchableOpacity>

      {quickAdd.isError && <Text style={styles.error}>{(quickAdd.error as Error).message}</Text>}

      {quickAdd.isSuccess && (
        <View style={styles.resultCard}>
          <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
          <Text style={styles.resultText}>Created: {describeResult(quickAdd.data)}</Text>
        </View>
      )}

      <View style={styles.examplesBlock}>
        <Text style={styles.examplesTitle}>Try things like:</Text>
        {EXAMPLES.map((example) => (
          <Text key={example} style={styles.exampleText}>
            "{example}"
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  heading: { fontSize: 20, fontWeight: "700" },
  subheading: { fontSize: 13, color: "#999" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    minHeight: 60,
    textAlignVertical: "top",
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
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f0fdf4",
  },
  resultText: { flex: 1, fontSize: 13, color: "#166534", fontWeight: "500" },
  examplesBlock: { gap: 4, marginTop: 8 },
  examplesTitle: { fontSize: 12, fontWeight: "600", color: "#666" },
  exampleText: { fontSize: 12, color: "#999", fontStyle: "italic" },
});
