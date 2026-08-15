import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDeleteHabit } from "../../hooks/useHabits";
import { useDeleteReminder } from "../../hooks/useReminders";
import { useDeleteGoal } from "../../hooks/useGoals";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import type { QuickAddResult } from "../../types";

interface ActionReceiptProps {
  result: QuickAddResult;
}

function describe(result: QuickAddResult): string {
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

export default function ActionReceipt({ result }: ActionReceiptProps) {
  const [undone, setUndone] = useState(false);
  const deleteReminder = useDeleteReminder();
  const deleteHabit = useDeleteHabit();
  const deleteGoal = useDeleteGoal();

  const isPending = deleteReminder.isPending || deleteHabit.isPending || deleteGoal.isPending;

  const handleUndo = () => {
    const onSuccess = { onSuccess: () => setUndone(true) };
    if (result.type === "reminder") {
      deleteReminder.mutate(result.item.id, onSuccess);
    } else if (result.type === "habit") {
      deleteHabit.mutate(result.item.id, onSuccess);
    } else {
      deleteGoal.mutate(result.item.id, onSuccess);
    }
  };

  if (undone) {
    return (
      <View style={styles.card}>
        <Ionicons name="arrow-undo" size={18} color={colors.textMuted} />
        <Text style={styles.undoneText}>Undone</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
      <Text style={styles.text}>Created: {describe(result)}</Text>
      <TouchableOpacity style={styles.undoButton} onPress={handleUndo} disabled={isPending}>
        {isPending ? (
          <ActivityIndicator size="small" color={colors.textMuted} />
        ) : (
          <Text style={styles.undoText}>Undo</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.elevatedSurface,
  },
  text: { flex: 1, fontSize: typography.secondary.fontSize, color: colors.success, fontWeight: "500" },
  undoneText: { flex: 1, fontSize: typography.secondary.fontSize, color: colors.textMuted },
  undoButton: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  undoText: { color: colors.accent, fontSize: typography.caption.fontSize, fontWeight: "600" },
});
