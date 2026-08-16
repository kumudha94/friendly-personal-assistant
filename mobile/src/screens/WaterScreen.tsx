import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWaterLogs, useSetWaterLog } from "../hooks/useWater";
import { todayStr } from "../utils/date";
import WaterProgressBar from "../components/WaterProgressBar";
import {
  formatWaterAmount,
  getWaterSettings,
  mlToUnitValue,
  servingMl,
  setWaterSettings,
  unitValueToMl,
  type WaterSettings,
  type WaterUnit,
} from "../lib/waterSettings";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";

const UNITS: { value: WaterUnit; label: string }[] = [
  { value: "glasses", label: "Glasses" },
  { value: "ml", label: "ml" },
  { value: "liters", label: "Liters" },
];

const MIN_TARGET_ML = 100;

export default function WaterScreen() {
  const waterQuery = useWaterLogs();
  const setWaterLog = useSetWaterLog();
  const [settings, setSettings] = useState<WaterSettings | null>(null);

  useEffect(() => {
    getWaterSettings().then(setSettings);
  }, []);

  if (waterQuery.isLoading || !settings) {
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
  const countMl = todayLog?.count ?? 0;
  const targetMl = todayLog?.target ?? settings.targetMl;
  const serving = servingMl(settings);

  const save = (nextCountMl: number, nextTargetMl: number) => {
    setWaterLog.mutate({
      date: today,
      count: Math.max(0, nextCountMl),
      target: Math.max(MIN_TARGET_ML, nextTargetMl),
    });
  };

  const applySettings = (next: WaterSettings) => {
    setSettings(next);
    setWaterSettings(next);
    save(countMl, next.targetMl);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Water intake</Text>

      <View style={styles.card}>
        <Text style={styles.countText}>{formatWaterAmount(countMl, settings)}</Text>
        <Text style={styles.countTarget}>of {formatWaterAmount(targetMl, settings)} target</Text>
        <WaterProgressBar count={countMl} target={targetMl} />

        <View style={styles.tapRow}>
          <TouchableOpacity
            style={[styles.tapButton, styles.tapButtonSecondary]}
            onPress={() => save(countMl - serving, targetMl)}
            disabled={countMl === 0}
          >
            <Ionicons name="remove" size={22} color={countMl === 0 ? colors.border : colors.water} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tapButton} onPress={() => save(countMl + serving, targetMl)}>
            <Ionicons name="add" size={22} color={colors.textPrimary} />
            <Text style={styles.tapButtonText}>
              Add {settings.unit === "glasses" ? "a glass" : formatWaterAmount(serving, settings)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.customizeCard}>
        <Text style={styles.customizeHeading}>Customize tracking</Text>

        <Text style={styles.customizeLabel}>Track in</Text>
        <View style={styles.pillRow}>
          {UNITS.map((u) => {
            const selected = settings.unit === u.value;
            return (
              <TouchableOpacity
                key={u.value}
                style={[styles.pill, selected && styles.pillSelected]}
                onPress={() => applySettings({ ...settings, unit: u.value })}
              >
                <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{u.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.customizeLabel}>Daily target ({UNITS.find((u) => u.value === settings.unit)?.label})</Text>
        <TextInput
          style={styles.customizeInput}
          keyboardType="decimal-pad"
          defaultValue={String(mlToUnitValue(settings.targetMl, settings))}
          onEndEditing={(e) => {
            const value = Number(e.nativeEvent.text);
            if (!Number.isFinite(value) || value <= 0) return;
            applySettings({ ...settings, targetMl: unitValueToMl(value, settings) });
          }}
        />

        {settings.unit === "glasses" && (
          <>
            <Text style={styles.customizeLabel}>Serving size (ml per glass)</Text>
            <TextInput
              style={styles.customizeInput}
              keyboardType="number-pad"
              defaultValue={String(settings.servingSizeMl)}
              onEndEditing={(e) => {
                const value = Number(e.nativeEvent.text);
                if (!Number.isFinite(value) || value <= 0) return;
                applySettings({ ...settings, servingSizeMl: Math.round(value) });
              }}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: spacing.md },
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
  countTarget: { fontSize: 14, fontWeight: "500", color: colors.textMuted, marginTop: -8 },
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
  customizeCard: {
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  customizeHeading: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  customizeLabel: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.xs },
  pillRow: { flexDirection: "row", gap: spacing.sm },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.control,
    alignItems: "center",
    backgroundColor: colors.elevatedSurface,
  },
  pillSelected: { backgroundColor: colors.accent },
  pillText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  pillTextSelected: { color: colors.textPrimary },
  customizeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.elevatedSurface,
    color: colors.textPrimary,
  },
});
