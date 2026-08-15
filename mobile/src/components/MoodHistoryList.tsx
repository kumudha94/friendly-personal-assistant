import { StyleSheet, Text, View } from "react-native";
import { format, parseISO } from "date-fns";
import type { MoodLog } from "../types";

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
  list: { gap: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  emoji: { fontSize: 18 },
  date: { fontSize: 13, fontWeight: "600", width: 52 },
  meta: { fontSize: 12, color: "#999" },
  emptyText: { fontSize: 13, color: "#999" },
});
