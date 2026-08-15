import { StyleSheet, Text, View } from "react-native";
import { format } from "date-fns";
import { averageCycleLength, predictNextStart } from "../utils/cycle";
import type { CycleLog } from "../types";

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
  card: { padding: 16, borderRadius: 12, backgroundColor: "#fdf2f8" },
  row: { flexDirection: "row" },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  divider: { width: 1, backgroundColor: "#fbcfe8" },
  value: { fontSize: 18, fontWeight: "700", color: "#be185d" },
  label: { fontSize: 12, color: "#999" },
  emptyText: { fontSize: 13, color: "#999" },
});
