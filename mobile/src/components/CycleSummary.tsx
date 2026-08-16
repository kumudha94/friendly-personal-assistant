import { StyleSheet, Text, View } from "react-native";
import { addDays, format } from "date-fns";
import { averageCycleLength, predictNextStartFromCycleLength } from "../utils/cycle";
import type { CycleLog } from "../types";
import { DEFAULT_CYCLE_SETTINGS, type CycleSettings } from "../lib/cycleSettings";
import { colors, radius, spacing, typography } from "../theme/tokens";

export default function CycleSummary({
  logs,
  settings = DEFAULT_CYCLE_SETTINGS,
}: {
  logs: CycleLog[];
  settings?: CycleSettings;
}) {
  const startDates = logs.map((l) => l.startDate);
  const avg = averageCycleLength(startDates);
  const predicted = predictNextStartFromCycleLength(startDates, settings.cycleLengthDays);

  if (startDates.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>
          Log your first period start date to get a predicted next date based on your cycle
          length setting below.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.value}>{avg !== null ? `${Math.round(avg)}d` : "—"}</Text>
          <Text style={styles.label}>logged avg</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.value}>{predicted ? format(predicted, "MMM d") : "—"}</Text>
          <Text style={styles.label}>predicted next</Text>
        </View>
      </View>
      {predicted && (
        <Text style={styles.rangeText}>
          Expected {format(predicted, "MMM d")} – {format(addDays(predicted, settings.periodLengthDays), "MMM d")}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, gap: spacing.sm },
  row: { flexDirection: "row" },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  divider: { width: 1, backgroundColor: colors.border },
  value: { fontSize: typography.sectionTitle.fontSize, fontWeight: "700", color: colors.cycle },
  label: { fontSize: 12, color: colors.textMuted },
  emptyText: { fontSize: 13, color: colors.textMuted },
  rangeText: { fontSize: 12, color: colors.textMuted, textAlign: "center" },
});
