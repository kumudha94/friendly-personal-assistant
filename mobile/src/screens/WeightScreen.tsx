import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { format, parseISO } from "date-fns";
import { useWeightLogs, useSetWeightLog } from "../hooks/useWeight";
import UnitToggle from "../components/UnitToggle";
import { todayStr } from "../utils/date";
import type { WeightLog, WeightUnit } from "../types";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";

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
          placeholderTextColor={colors.textMuted}
          value={weight}
          onChangeText={setWeight}
        />
        <UnitToggle value={unit} onChange={setUnit} />
      </View>
      <TouchableOpacity style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSave} disabled={!canSubmit}>
        {setWeightLog.isPending ? (
          <ActivityIndicator color={colors.textPrimary} />
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
  list: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: spacing.xs },
  headerGap: { gap: 12, marginBottom: spacing.xs },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, gap: 12 },
  heading: { fontSize: typography.body.fontSize, fontWeight: "700", color: colors.textPrimary },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  button: { backgroundColor: colors.accent, borderRadius: radius.control, paddingVertical: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  error: { color: colors.error, fontSize: 12 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  emptyText: { fontSize: 13, color: colors.textMuted },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDate: { fontSize: 13, fontWeight: "600", width: 52, color: colors.textSecondary },
  historyWeight: { flex: 1, fontSize: 13, color: colors.textPrimary },
  historyDelta: { fontSize: 12, fontWeight: "600" },
  deltaUp: { color: colors.error },
  deltaDown: { color: colors.success },
});
