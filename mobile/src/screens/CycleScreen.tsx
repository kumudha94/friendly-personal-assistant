import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, parseISO } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useCycleLogs, useCreateCycleLog, useUpdateCycleLog, useDeleteCycleLog } from "../hooks/useCycle";
import CycleSummary from "../components/CycleSummary";
import { todayStr } from "../utils/date";
import type { CycleLog } from "../types";

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
            <ActivityIndicator color="#fff" />
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
          <ActivityIndicator color="#fff" />
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
        <Ionicons name="trash-outline" size={16} color="#dc2626" />
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
  list: { padding: 16, gap: 4 },
  headerGap: { gap: 12, marginBottom: 4 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#dc2626", textAlign: "center", padding: 24 },
  card: { padding: 16, borderRadius: 12, backgroundColor: "#f5f5f7", gap: 10 },
  heading: { fontSize: 16, fontWeight: "700" },
  subtext: { fontSize: 13, color: "#666" },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dateText: { fontSize: 14, fontWeight: "600" },
  button: { backgroundColor: "#4f46e5", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#666" },
  emptyText: { fontSize: 13, color: "#999" },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  historyText: { fontSize: 13, color: "#111" },
});
