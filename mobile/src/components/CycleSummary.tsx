import { StyleSheet, Text, View } from "react-native";
import { format } from "date-fns";
import { averageCycleLength, predictNextStart } from "../utils/cycle";
import type { CycleLog } from "../types";
import { colors, radius, spacing, typography } from "../theme/tokens";

export default function CycleSummary({ logs }: { logs: CycleLog[] }) {
  const startDates = logs.map((l) => l.startDate);
  const avg = averageCycleLength(startDates);
  const predicted = predictNextStart(startDates);

  if (avg === null) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>
          Log at least two period start dates to see your average cycle length and a predicted
          next date.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.value}>{Math.round(avg)}d</Text>
          <Text style={styles.label}>avg cycle</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.value}>{predicted ? format(predicted, "MMM d") : "—"}</Text>
          <Text style={styles.label}>predicted next</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface },
  row: { flexDirection: "row" },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  divider: { width: 1, backgroundColor: colors.border },
  value: { fontSize: typography.sectionTitle.fontSize, fontWeight: "700", color: colors.cycle },
  label: { fontSize: 12, color: colors.textMuted },
  emptyText: { fontSize: 13, color: colors.textMuted },
});
