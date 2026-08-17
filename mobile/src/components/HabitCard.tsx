import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Frequency, Habit, HabitLog } from "../types";
import { calculateStreak } from "../utils/streak";
import { todayStr } from "../utils/date";
import WeekGrid from "./WeekGrid";
import FrequencyPicker from "./FrequencyPicker";
import { useToggleHabitLog } from "../hooks/useHabitLogs";
import { useDeleteHabit, useUpdateHabit } from "../hooks/useHabits";
import { colors, radius, spacing } from "../theme/tokens";

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  isLinkedToGoal: boolean;
}

export default function HabitCard({ habit, logs, isLinkedToGoal }: HabitCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [frequency, setFrequency] = useState<Frequency>(habit.frequency);
  const [targetCount, setTargetCount] = useState(String(habit.targetCount));

  const toggleLog = useToggleHabitLog();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  const today = todayStr();
  const todayLog = logs.find((l) => l.date === today);
  const completedToday = todayLog?.completed ?? false;
  const streak = calculateStreak(logs);
  const completedDates = new Set(logs.filter((l) => l.completed).map((l) => l.date));

  const canSave = name.trim().length > 0 && !updateHabit.isPending;

  function startEditing() {
    setName(habit.name);
    setFrequency(habit.frequency);
    setTargetCount(String(habit.targetCount));
    setEditing(true);
  }

  function handleSave() {
    if (!canSave) return;
    updateHabit.mutate(
      { id: habit.id, patch: { name: name.trim(), frequency, targetCount: Number(targetCount) || 1 } },
      { onSuccess: () => setEditing(false) },
    );
  }

  function handleDelete() {
    Alert.alert(
      "Delete habit?",
      `Since "${habit.name}" isn't linked with any goal, you can delete it, but this action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteHabit.mutate(habit.id, {
              onError: (err) => Alert.alert("Couldn't delete habit", (err as Error).message),
            }),
        },
      ],
    );
  }

  if (editing) {
    return (
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Habit name"
          placeholderTextColor={colors.textMuted}
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
        {updateHabit.isError && (
          <Text style={styles.error}>{(updateHabit.error as Error).message}</Text>
        )}
        <View style={styles.editActionsRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveButton, !canSave && styles.saveButtonDisabled]} onPress={handleSave} disabled={!canSave}>
            {updateHabit.isPending ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={startEditing} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.checkbox, completedToday && styles.checkboxChecked]}
          onPress={() =>
            toggleLog.mutate({ habitId: habit.id, date: today, completed: !completedToday })
          }
        >
          {completedToday && <Ionicons name="checkmark" size={16} color={colors.textPrimary} />}
        </TouchableOpacity>
        <View style={styles.titleGroup}>
          <Text style={styles.name}>{habit.name}</Text>
          <Text style={styles.meta}>
            {habit.frequency} · target {habit.targetCount}
          </Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={14} color={colors.warning} />
          <Text style={styles.streakText}>{streak}</Text>
        </View>
        {!isLinkedToGoal && (
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
      <WeekGrid completedDates={completedDates} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.accent },
  titleGroup: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  streakText: { fontSize: 13, fontWeight: "600", color: colors.warning },

  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.elevatedSurface,
    color: colors.textPrimary,
  },
  targetRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  targetInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 64,
    textAlign: "center",
    backgroundColor: colors.elevatedSurface,
    color: colors.textPrimary,
  },
  error: { color: colors.error, fontSize: 12 },
  editActionsRow: { flexDirection: "row", gap: spacing.sm },
  cancelButton: {
    flex: 1,
    borderRadius: radius.control,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: { color: colors.textSecondary, fontWeight: "600" },
  saveButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radius.control,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: colors.textPrimary, fontWeight: "600" },
});
