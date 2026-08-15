import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWaterLogs, useSetWaterLog } from "../hooks/useWater";
import { todayStr } from "../utils/date";
import WaterProgressBar from "../components/WaterProgressBar";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";

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
            <Ionicons name="remove" size={22} color={count === 0 ? colors.border : colors.water} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tapButton} onPress={() => save(count + 1, target)}>
            <Ionicons name="add" size={22} color={colors.textPrimary} />
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
            <Ionicons name="remove" size={16} color={target <= MIN_TARGET ? colors.border : colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.targetValue}>{target}</Text>
          <TouchableOpacity style={styles.targetButton} onPress={() => save(count, target + 1)}>
            <Ionicons name="add" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: spacing.md },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  heading: { fontSize: typography.sectionTitle.fontSize, fontWeight: "700", color: colors.textPrimary },
  card: {
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    gap: 12,
  },
  countText: { fontSize: 32, fontWeight: "700", color: colors.water },
  countTarget: { fontSize: 16, fontWeight: "500", color: colors.textMuted },
  tapRow: { flexDirection: "row", gap: 10 },
  tapButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.water,
    borderRadius: radius.control,
    paddingVertical: 12,
  },
  tapButtonSecondary: {
    flex: 0,
    width: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.water,
  },
  tapButtonText: { color: colors.textPrimary, fontWeight: "600" },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  targetLabel: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  targetControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  targetButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  targetValue: { fontSize: 16, fontWeight: "700", minWidth: 24, textAlign: "center", color: colors.textPrimary },
});
