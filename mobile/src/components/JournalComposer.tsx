import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { JournalType } from "../types";
import { JOURNAL_PROMPTS, JOURNAL_TYPE_LABELS } from "../utils/journalPrompts";
import { todayStr } from "../utils/date";
import { useCreateJournalEntry } from "../hooks/useJournal";
import { useMoodLogs, useSetMoodLog } from "../hooks/useMood";
import ScaleTapPicker from "./ScaleTapPicker";
import { colors, radius, spacing } from "../theme/tokens";

const TYPES: JournalType[] = ["daily", "weekly", "monthly"];

export default function JournalComposer() {
  const [type, setType] = useState<JournalType>("daily");
  const [content, setContent] = useState("");
  const createEntry = useCreateJournalEntry();

  const moodQuery = useMoodLogs();
  const setMoodLog = useSetMoodLog();
  const today = todayStr();
  const todayMoodLog = (moodQuery.data ?? []).find((l) => l.date === today);

  const [moodScale, setMoodScale] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepHours, setSleepHours] = useState("7");

  useEffect(() => {
    if (todayMoodLog) {
      setMoodScale(todayMoodLog.moodScale);
      setEnergyLevel(todayMoodLog.energyLevel);
      setSleepHours(String(todayMoodLog.sleepHours));
    }
    // Only re-sync when a fresh server record for today first arrives, not on every local edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayMoodLog?.id]);

  const canSubmit = content.trim().length > 0 && !createEntry.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createEntry.mutate(
      { type, date: today, content: content.trim() },
      { onSuccess: () => setContent("") },
    );
    if (type === "daily") {
      setMoodLog.mutate({
        date: today,
        moodScale,
        energyLevel,
        sleepHours: Number(sleepHours) || 0,
        notes: null,
      });
    }
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
        placeholderTextColor={colors.textMuted}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={5}
      />

      {type === "daily" && (
        <View style={styles.moodSection}>
          <Text style={styles.moodHeading}>How are you feeling?</Text>
          <ScaleTapPicker label="Mood" value={moodScale} onChange={setMoodScale} />
          <ScaleTapPicker label="Energy" value={energyLevel} onChange={setEnergyLevel} />
          <View>
            <Text style={styles.sleepLabel}>Sleep (hours)</Text>
            <TextInput
              style={styles.sleepInput}
              keyboardType="decimal-pad"
              value={sleepHours}
              onChangeText={setSleepHours}
            />
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {createEntry.isPending ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Save entry</Text>
        )}
      </TouchableOpacity>
      {createEntry.isError && (
        <Text style={styles.error}>{(createEntry.error as Error).message}</Text>
      )}
      {setMoodLog.isError && (
        <Text style={styles.error}>{(setMoodLog.error as Error).message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, gap: 10 },
  typeRow: { flexDirection: "row", gap: spacing.sm },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillText: { color: colors.textSecondary, fontSize: 12, fontWeight: "500" },
  pillTextSelected: { color: colors.textPrimary },
  prompt: { fontSize: 12, color: colors.textSecondary, fontStyle: "italic" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    minHeight: 100,
    textAlignVertical: "top",
    color: colors.textPrimary,
  },
  moodSection: {
    gap: 12,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  moodHeading: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  sleepLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
  sleepInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
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
