import { StyleSheet, Text, View } from "react-native";
import { format, parseISO } from "date-fns";
import type { MoodLog } from "../types";
import { colors, spacing } from "../theme/tokens";

const MOOD_EMOJI = ["", "😞", "😕", "😐", "🙂", "😄"];

export default function MoodHistoryList({ logs }: { logs: MoodLog[] }) {
  const recent = logs.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);

  if (recent.length === 0) {
    return <Text style={styles.emptyText}>No check-ins yet.</Text>;
  }

  return (
    <View style={styles.list}>
      {recent.map((log) => (
        <View key={log.id} style={styles.row}>
          <Text style={styles.emoji}>{MOOD_EMOJI[log.moodScale] ?? "🙂"}</Text>
          <Text style={styles.date}>{format(parseISO(log.date), "MMM d")}</Text>
          <Text style={styles.meta}>
            Energy {log.energyLevel}/5 · {log.sleepHours}h sleep
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.xs },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: spacing.xs },
  emoji: { fontSize: 18 },
  date: { fontSize: 13, fontWeight: "600", width: 52, color: colors.textSecondary },
  meta: { fontSize: 12, color: colors.textMuted },
  emptyText: { fontSize: 13, color: colors.textMuted },
});
