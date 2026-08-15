import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGenerateDigest } from "../hooks/useDigest";

type Period = "daily" | "weekly";

export default function DigestScreen() {
  const [period, setPeriod] = useState<Period>("daily");
  const generateDigest = useGenerateDigest();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Milo digest</Text>
      <Text style={styles.subheading}>
        A Claude-generated summary of your recent habits, reminders, water, mood, and goals.
      </Text>

      <View style={styles.pillRow}>
        {(["daily", "weekly"] as Period[]).map((p) => {
          const selected = p === period;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                {p === "daily" ? "Daily" : "Weekly"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => generateDigest.mutate(period)}
        disabled={generateDigest.isPending}
      >
        {generateDigest.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Generate digest</Text>
        )}
      </TouchableOpacity>

      {generateDigest.isError && (
        <Text style={styles.error}>{(generateDigest.error as Error).message}</Text>
      )}

      {generateDigest.data && (
        <View style={styles.resultCard}>
          <Text style={styles.resultText}>{generateDigest.data.text}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  heading: { fontSize: 20, fontWeight: "700" },
  subheading: { fontSize: 13, color: "#999" },
  pillRow: { flexDirection: "row", gap: 8 },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f5f5f7",
  },
  pillSelected: { backgroundColor: "#4f46e5" },
  pillText: { fontSize: 13, fontWeight: "600", color: "#333" },
  pillTextSelected: { color: "#fff" },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 12 },
  resultCard: { padding: 16, borderRadius: 12, backgroundColor: "#f5f5f7" },
  resultText: { fontSize: 14, color: "#111", lineHeight: 21 },
});
