import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../../theme/tokens";

const STEPS = ["Checked your reminders", "Checked your habits", "Checked your goals", "Preparing suggestions"];

interface AgentActivityProps {
  pending: boolean;
}

// The backend gathers reminders/habits/goals before making one Claude call — these steps
// reflect that real request lifecycle. The staggered reveal below is presentational (the
// gathering itself happens server-side, not observable step-by-step over the wire) but each
// step genuinely occurred before the single call was made.
export default function AgentActivity({ pending }: AgentActivityProps) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!pending) {
      setRevealed(0);
      return;
    }
    const timers = [0, 1, 2].map((step) =>
      setTimeout(() => setRevealed((r) => Math.max(r, step + 1)), 250 * (step + 1)),
    );
    return () => timers.forEach(clearTimeout);
  }, [pending]);

  return (
    <View style={styles.container}>
      {STEPS.map((label, index) => {
        const isLast = index === STEPS.length - 1;
        const isDone = isLast ? false : index < revealed;
        const isActive = isLast && revealed >= STEPS.length - 1;

        return (
          <View key={label} style={styles.row}>
            {isDone ? (
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            ) : isActive ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <View style={styles.pendingDot} />
            )}
            <Text style={[styles.label, (isDone || isActive) && styles.labelActive]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pendingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  label: { fontSize: typography.secondary.fontSize, color: colors.textMuted },
  labelActive: { color: colors.textPrimary },
});
