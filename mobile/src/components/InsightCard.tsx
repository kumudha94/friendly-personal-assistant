import { StyleSheet, Text, View } from "react-native";
import { correlationLabel } from "../utils/correlation";

export default function InsightCard({
  title,
  r,
  n,
}: {
  title: string;
  r: number | null;
  n: number;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {r === null ? (
        <Text style={styles.subtleText}>
          {n < 3 ? `Not enough data yet (${n} day${n === 1 ? "" : "s"} logged) — keep checking in.` : "No clear pattern yet."}
        </Text>
      ) : (
        <>
          <Text style={styles.label}>{correlationLabel(r)}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.abs(r) * 100}%` },
                r < 0 && styles.barFillNegative,
              ]}
            />
          </View>
          <Text style={styles.meta}>
            r = {r.toFixed(2)} · {n} days
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    gap: 6,
  },
  title: { fontSize: 14, fontWeight: "600" },
  label: { fontSize: 13, fontWeight: "600", color: "#4f46e5" },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: "#e5e5e5", overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: "#4f46e5", borderRadius: 4 },
  barFillNegative: { backgroundColor: "#dc2626" },
  meta: { fontSize: 11, color: "#999" },
  subtleText: { fontSize: 12, color: "#999" },
});
