import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { JournalType } from "../types";
import { JOURNAL_PROMPTS, JOURNAL_TYPE_LABELS } from "../utils/journalPrompts";
import { todayStr } from "../utils/date";
import { useCreateJournalEntry } from "../hooks/useJournal";

const TYPES: JournalType[] = ["daily", "weekly", "monthly"];

export default function JournalComposer() {
  const [type, setType] = useState<JournalType>("daily");
  const [content, setContent] = useState("");
  const createEntry = useCreateJournalEntry();

  const canSubmit = content.trim().length > 0 && !createEntry.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createEntry.mutate(
      { type, date: todayStr(), content: content.trim() },
      { onSuccess: () => setContent("") },
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.typeRow}>
        {TYPES.map((t) => {
          const selected = t === type;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                {JOURNAL_TYPE_LABELS[t]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.prompt}>{JOURNAL_PROMPTS[type]}</Text>
      <TextInput
        style={styles.input}
        placeholder="Write here…"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={5}
      />
      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {createEntry.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save entry</Text>
        )}
      </TouchableOpacity>
      {createEntry.isError && (
        <Text style={styles.error}>{(createEntry.error as Error).message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, backgroundColor: "#f5f5f7", gap: 10 },
  typeRow: { flexDirection: "row", gap: 8 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  pillSelected: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  pillText: { color: "#333", fontSize: 12, fontWeight: "500" },
  pillTextSelected: { color: "#fff" },
  prompt: { fontSize: 12, color: "#666", fontStyle: "italic" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    minHeight: 100,
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
});
