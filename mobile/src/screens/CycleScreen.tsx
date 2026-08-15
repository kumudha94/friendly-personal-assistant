import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, parseISO } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useCycleLogs, useCreateCycleLog, useUpdateCycleLog, useDeleteCycleLog } from "../hooks/useCycle";
import CycleSummary from "../components/CycleSummary";
import { todayStr } from "../utils/date";
import type { CycleLog } from "../types";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";

function LogPeriodControl({ ongoing }: { ongoing: CycleLog | undefined }) {
  const [startDate, setStartDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const createCycleLog = useCreateCycleLog();
  const updateCycleLog = useUpdateCycleLog();

  if (ongoing) {
    return (
      <View style={styles.card}>
        <Text style={styles.heading}>Period ongoing</Text>
        <Text style={styles.subtext}>Started {format(parseISO(ongoing.startDate), "MMM d, yyyy")}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => updateCycleLog.mutate({ id: ongoing.id, patch: { endDate: todayStr() } })}
          disabled={updateCycleLog.isPending}
        >
          {updateCycleLog.isPending ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.buttonText}>End period today</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Log a period</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>{format(startDate, "MMM d, yyyy")}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(_event, selected) => {
            setShowPicker(false);
            if (selected) setStartDate(selected);
          }}
        />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => createCycleLog.mutate({ startDate: format(startDate, "yyyy-MM-dd") })}
        disabled={createCycleLog.isPending}
      >
        {createCycleLog.isPending ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Log period start</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function CycleHistoryRow({ log }: { log: CycleLog }) {
  const deleteCycleLog = useDeleteCycleLog();
  return (
    <View style={styles.historyRow}>
      <Text style={styles.historyText}>
        {format(parseISO(log.startDate), "MMM d, yyyy")}
        {log.endDate ? ` – ${format(parseISO(log.endDate), "MMM d")}` : " (ongoing)"}
      </Text>
      <TouchableOpacity onPress={() => deleteCycleLog.mutate(log.id)}>
        <Ionicons name="trash-outline" size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
}

export default function CycleScreen() {
  const cycleQuery = useCycleLogs();

  if (cycleQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (cycleQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load cycle logs.</Text>
      </View>
    );
  }

  const logs = (cycleQuery.data ?? []).slice().sort((a, b) => b.startDate.localeCompare(a.startDate));
  const ongoing = logs.find((l) => !l.endDate);

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={logs}
      keyExtractor={(item: CycleLog) => String(item.id)}
      ListHeaderComponent={
        <View style={styles.headerGap}>
          <CycleSummary logs={logs} />
          <LogPeriodControl ongoing={ongoing} />
          <Text style={styles.sectionTitle}>History</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>No cycles logged yet.</Text>}
      renderItem={({ item }) => <CycleHistoryRow log={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: spacing.xs },
  headerGap: { gap: 12, marginBottom: spacing.xs },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, gap: 10 },
  heading: { fontSize: typography.body.fontSize, fontWeight: "700", color: colors.textPrimary },
  subtext: { fontSize: 13, color: colors.textSecondary },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  dateText: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  button: { backgroundColor: colors.accent, borderRadius: radius.control, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  emptyText: { fontSize: 13, color: colors.textMuted },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyText: { fontSize: 13, color: colors.textPrimary },
});
