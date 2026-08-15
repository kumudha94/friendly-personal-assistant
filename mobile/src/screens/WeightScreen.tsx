import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { format, parseISO } from "date-fns";
import { useWeightLogs, useSetWeightLog } from "../hooks/useWeight";
import UnitToggle from "../components/UnitToggle";
import { todayStr } from "../utils/date";
import type { WeightLog, WeightUnit } from "../types";

function WeightForm() {
  const weightQuery = useWeightLogs();
  const setWeightLog = useSetWeightLog();
  const today = todayStr();
  const todayLog = (weightQuery.data ?? []).find((l) => l.date === today);

  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");

  useEffect(() => {
    if (todayLog) {
      setWeight(String(todayLog.weight));
      setUnit(todayLog.unit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayLog?.id]);

  const canSubmit = Number(weight) > 0 && !setWeightLog.isPending;

  const handleSave = () => {
    if (!canSubmit) return;
    setWeightLog.mutate({ date: today, weight: Number(weight), unit });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Today's weight</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0.0"
          value={weight}
          onChangeText={setWeight}
        />
        <UnitToggle value={unit} onChange={setUnit} />
      </View>
      <TouchableOpacity style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSave} disabled={!canSubmit}>
        {setWeightLog.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{todayLog ? "Update" : "Save"}</Text>
        )}
      </TouchableOpacity>
      {setWeightLog.isError && (
        <Text style={styles.error}>{(setWeightLog.error as Error).message}</Text>
      )}
    </View>
  );
}

function WeightHistoryRow({ log, previous }: { log: WeightLog; previous?: WeightLog }) {
  const delta = previous ? log.weight - previous.weight : null;
  return (
    <View style={styles.historyRow}>
      <Text style={styles.historyDate}>{format(parseISO(log.date), "MMM d")}</Text>
      <Text style={styles.historyWeight}>
        {log.weight} {log.unit}
      </Text>
      {delta !== null && delta !== 0 && (
        <Text style={[styles.historyDelta, delta > 0 ? styles.deltaUp : styles.deltaDown]}>
          {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
        </Text>
      )}
    </View>
  );
}

export default function WeightScreen() {
  const weightQuery = useWeightLogs();

  if (weightQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (weightQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Couldn't load weight logs: {(weightQuery.error as Error).message}
        </Text>
      </View>
    );
  }

  const logs = (weightQuery.data ?? []).slice().sort((a, b) => b.date.localeCompare(a.date));

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={logs}
      keyExtractor={(item: WeightLog) => String(item.id)}
      ListHeaderComponent={
        <View style={styles.headerGap}>
          <WeightForm />
          <Text style={styles.sectionTitle}>History</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>No entries yet.</Text>}
      renderItem={({ item, index }) => <WeightHistoryRow log={item} previous={logs[index + 1]} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 4 },
  headerGap: { gap: 12, marginBottom: 4 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#dc2626", textAlign: "center", padding: 24 },
  card: { padding: 16, borderRadius: 12, backgroundColor: "#f5f5f7", gap: 12 },
  heading: { fontSize: 16, fontWeight: "700" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  button: { backgroundColor: "#4f46e5", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 12 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#666" },
  emptyText: { fontSize: 13, color: "#999" },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  historyDate: { fontSize: 13, fontWeight: "600", width: 52 },
  historyWeight: { flex: 1, fontSize: 13, color: "#111" },
  historyDelta: { fontSize: 12, fontWeight: "600" },
  deltaUp: { color: "#dc2626" },
  deltaDown: { color: "#16a34a" },
});
