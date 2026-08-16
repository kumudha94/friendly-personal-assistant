import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import type { Goal } from "../types";
import { useHabits } from "../hooks/useHabits";
import { useHabitLogs } from "../hooks/useHabitLogs";
import { useDeleteGoal, useUpdateGoal } from "../hooks/useGoals";
import { calculateStreak } from "../utils/streak";
import { colors, radius, spacing } from "../theme/tokens";

export default function GoalCard({ goal }: { goal: Goal }) {
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const habitsQuery = useHabits();
  const logsQuery = useHabitLogs();
  const [editing, setEditing] = useState(false);

  const linkedHabit = habitsQuery.data?.find((h) => h.id === goal.habitId);
  const linkedStreak = linkedHabit
    ? calculateStreak((logsQuery.data ?? []).filter((l) => l.habitId === linkedHabit.id))
    : null;

  if (editing) {
    return (
      <GoalEditForm
        goal={goal}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.checkbox, goal.completed && styles.checkboxChecked]}
          onPress={() => updateGoal.mutate({ id: goal.id, patch: { completed: !goal.completed } })}
        >
          {goal.completed && <Ionicons name="checkmark" size={14} color={colors.textPrimary} />}
        </TouchableOpacity>
        <View style={styles.titleGroup}>
          <Text style={[styles.title, goal.completed && styles.titleDone]}>{goal.title}</Text>
          {!!goal.description && <Text style={styles.description}>{goal.description}</Text>}
          <View style={styles.metaRow}>
            {goal.targetDate && (
              <Text style={styles.meta}>Due {format(parseISO(goal.targetDate), "MMM d, yyyy")}</Text>
            )}
            {linkedHabit && (
              <View style={styles.habitBadge}>
                <Ionicons name="checkmark-circle" size={12} color={colors.accent} />
                <Text style={styles.habitBadgeText}>
                  {linkedHabit.name}
                  {linkedStreak ? ` · ${linkedStreak}d streak` : ""}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => setEditing(true)}>
          <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteGoal.mutate(goal.id)}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function GoalEditForm({ goal, onCancel, onSaved }: { goal: Goal; onCancel: () => void; onSaved: () => void }) {
  const updateGoal = useUpdateGoal();
  const habitsQuery = useHabits();
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description ?? "");
  const [habitId, setHabitId] = useState<number | null>(goal.habitId ?? null);
  const [targetDate, setTargetDate] = useState<Date | null>(
    goal.targetDate ? parseISO(goal.targetDate) : null,
  );
  const [showPicker, setShowPicker] = useState(false);

  const habits = habitsQuery.data ?? [];
  const canSave = title.trim().length > 0 && !updateGoal.isPending;

  const handleSave = () => {
    if (!canSave) return;
    updateGoal.mutate(
      {
        id: goal.id,
        patch: {
          title: title.trim(),
          description: description.trim() || null,
          habitId,
          targetDate: targetDate ? format(targetDate, "yyyy-MM-dd") : null,
        },
      },
      { onSuccess: onSaved },
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.editLabel}>Edit goal</Text>
      <TextInput
        style={styles.editInput}
        placeholder="Goal title"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.editInput}
        placeholder="Notes (optional)"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {habits.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.editChipRow}>
            {habits.map((habit) => {
              const selected = habitId === habit.id;
              return (
                <TouchableOpacity
                  key={habit.id}
                  style={[styles.editChip, selected && styles.editChipSelected]}
                  onPress={() => setHabitId(selected ? null : habit.id)}
                >
                  <Text style={[styles.editChipText, selected && styles.editChipTextSelected]}>
                    {habit.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      <View style={styles.editDateRow}>
        <TouchableOpacity style={styles.editDateButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.editDateText}>
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

      <View style={styles.editActionsRow}>
        <TouchableOpacity style={styles.editCancelButton} onPress={onCancel} disabled={updateGoal.isPending}>
          <Text style={styles.editCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editSaveButton} onPress={handleSave} disabled={!canSave}>
          {updateGoal.isPending ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.editSaveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
      {updateGoal.isError && <Text style={styles.error}>{(updateGoal.error as Error).message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: colors.accent },
  titleGroup: { flex: 1, gap: spacing.xs },
  title: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  titleDone: { color: colors.textMuted, textDecorationLine: "line-through" },
  description: { fontSize: 13, color: colors.textSecondary },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: 2 },
  meta: { fontSize: 11, color: colors.textMuted },
  habitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  habitBadgeText: { fontSize: 11, fontWeight: "600", color: colors.accent },

  editLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  editInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.elevatedSurface,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  editChipRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  editChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevatedSurface,
  },
  editChipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  editChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: "500" },
  editChipTextSelected: { color: colors.textPrimary },
  editDateRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: spacing.xs },
  editDateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.elevatedSurface,
  },
  editDateText: { fontSize: 14, fontWeight: "500", color: colors.textPrimary },
  clearText: { color: colors.error, fontSize: 13, fontWeight: "600" },
  editActionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  editCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.control,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  editCancelText: { color: colors.textSecondary, fontWeight: "600" },
  editSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.control,
    alignItems: "center",
    backgroundColor: colors.accent,
  },
  editSaveText: { color: colors.textPrimary, fontWeight: "600" },
  error: { color: colors.error, fontSize: 12 },
});
