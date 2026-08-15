import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWaterLogs, useSetWaterLog } from "../hooks/useWater";
import { todayStr } from "../utils/date";
import WaterProgressBar from "../components/WaterProgressBar";

const DEFAULT_TARGET = 8;
const MIN_TARGET = 1;

export default function WaterScreen() {
  const waterQuery = useWaterLogs();
  const setWaterLog = useSetWaterLog();

  if (waterQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (waterQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Couldn't load water intake: {(waterQuery.error as Error).message}
        </Text>
      </View>
    );
  }

  const today = todayStr();
  const todayLog = (waterQuery.data ?? []).find((l) => l.date === today);
  const count = todayLog?.count ?? 0;
  const target = todayLog?.target ?? DEFAULT_TARGET;

  const save = (nextCount: number, nextTarget: number) => {
    setWaterLog.mutate({
      date: today,
      count: Math.max(0, nextCount),
      target: Math.max(MIN_TARGET, nextTarget),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Water intake</Text>

      <View style={styles.card}>
        <Text style={styles.countText}>
          {count} <Text style={styles.countTarget}>/ {target} glasses</Text>
        </Text>
        <WaterProgressBar count={count} target={target} />

        <View style={styles.tapRow}>
          <TouchableOpacity
            style={[styles.tapButton, styles.tapButtonSecondary]}
            onPress={() => save(count - 1, target)}
            disabled={count === 0}
          >
            <Ionicons name="remove" size={22} color={count === 0 ? "#ccc" : "#0ea5e9"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tapButton} onPress={() => save(count + 1, target)}>
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={styles.tapButtonText}>Add a glass</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.targetRow}>
        <Text style={styles.targetLabel}>Daily target</Text>
        <View style={styles.targetControls}>
          <TouchableOpacity
            style={styles.targetButton}
            onPress={() => save(count, target - 1)}
            disabled={target <= MIN_TARGET}
          >
            <Ionicons name="remove" size={16} color={target <= MIN_TARGET ? "#ccc" : "#333"} />
          </TouchableOpacity>
          <Text style={styles.targetValue}>{target}</Text>
          <TouchableOpacity style={styles.targetButton} onPress={() => save(count, target + 1)}>
            <Ionicons name="add" size={16} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#dc2626", textAlign: "center", padding: 24 },
  heading: { fontSize: 20, fontWeight: "700" },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f7",
    gap: 12,
  },
  countText: { fontSize: 32, fontWeight: "700", color: "#0ea5e9" },
  countTarget: { fontSize: 16, fontWeight: "500", color: "#999" },
  tapRow: { flexDirection: "row", gap: 10 },
  tapButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0ea5e9",
    borderRadius: 8,
    paddingVertical: 12,
  },
  tapButtonSecondary: {
    flex: 0,
    width: 48,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  tapButtonText: { color: "#fff", fontWeight: "600" },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  targetLabel: { fontSize: 14, fontWeight: "600" },
  targetControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  targetButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  targetValue: { fontSize: 16, fontWeight: "700", minWidth: 24, textAlign: "center" },
});
