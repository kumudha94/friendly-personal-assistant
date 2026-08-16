import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useHabits } from "../hooks/useHabits";
import { useHabitLogs } from "../hooks/useHabitLogs";
import { useWaterLogs, useSetWaterLog } from "../hooks/useWater";
import { useGoals } from "../hooks/useGoals";
import { useMedications, useMedicationLogs } from "../hooks/useMedications";
import { useCycleLogs } from "../hooks/useCycle";
import { todayStr } from "../utils/date";
import DashboardHabitRow from "../components/DashboardHabitRow";
import DashboardWaterRow from "../components/DashboardWaterRow";
import MedicationCard from "../components/MedicationCard";
import CycleSummary from "../components/CycleSummary";
import MiloInsight from "../components/milo/MiloInsight";
import { colors, MILO_BAR_CLEARANCE, spacing, typography } from "../theme/tokens";
import { dismissToday, getDismissals, isDismissed, muteForever, type Dismissals } from "../lib/insights";
import { computeInsights } from "../lib/miloInsights";
import { DEFAULT_WATER_SETTINGS, getWaterSettings, servingMl, type WaterSettings } from "../lib/waterSettings";
import { DEFAULT_CYCLE_SETTINGS, getCycleSettings, type CycleSettings } from "../lib/cycleSettings";

export default function PersonalScreen() {
  const habitsQuery = useHabits();
  const logsQuery = useHabitLogs();
  const waterQuery = useWaterLogs();
  const goalsQuery = useGoals();
  const medicationsQuery = useMedications();
  const medicationLogsQuery = useMedicationLogs();
  const cycleQuery = useCycleLogs();
  const setWaterLog = useSetWaterLog();
  const [refreshing, setRefreshing] = useState(false);
  const [dismissals, setDismissals] = useState<Dismissals>({});
  const [waterSettings, setWaterSettingsState] = useState<WaterSettings>(DEFAULT_WATER_SETTINGS);
  const [cycleSettings, setCycleSettingsState] = useState<CycleSettings>(DEFAULT_CYCLE_SETTINGS);

  useEffect(() => {
    getDismissals().then(setDismissals);
    getWaterSettings().then(setWaterSettingsState);
    getCycleSettings().then(setCycleSettingsState);
  }, []);

  const isLoading =
    habitsQuery.isLoading ||
    logsQuery.isLoading ||
    waterQuery.isLoading ||
    goalsQuery.isLoading ||
    medicationsQuery.isLoading ||
    medicationLogsQuery.isLoading ||
    cycleQuery.isLoading;
  const isError =
    habitsQuery.isError ||
    logsQuery.isError ||
    waterQuery.isError ||
    goalsQuery.isError ||
    medicationsQuery.isError ||
    medicationLogsQuery.isError ||
    cycleQuery.isError;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load your personal tracking. Pull down to retry.</Text>
      </View>
    );
  }

  const habits = habitsQuery.data ?? [];
  const logs = logsQuery.data ?? [];
  const waterLogs = waterQuery.data ?? [];
  const goals = goalsQuery.data ?? [];
  const medications = (medicationsQuery.data ?? []).filter((m) => m.active);
  const medicationLogs = medicationLogsQuery.data ?? [];
  const cycleLogs = cycleQuery.data ?? [];

  const today = todayStr();
  const todayWaterLog = waterLogs.find((l) => l.date === today);
  const waterCount = todayWaterLog?.count ?? 0;
  const waterTarget = todayWaterLog?.target ?? waterSettings.targetMl;
  const serving = servingMl(waterSettings);

  const habitsWithLogs = habits.map((habit) => ({
    habit,
    logs: logs.filter((l) => l.habitId === habit.id),
  }));

  const allInsights = computeInsights({
    habits,
    habitLogs: logs,
    waterCount,
    waterTarget,
    onLogWater: () => setWaterLog.mutate({ date: today, count: waterCount + serving, target: waterTarget }),
    goals,
    waterSettings,
  });
  const visibleInsights = allInsights.filter((insight) => !isDismissed(dismissals, insight.id, today));

  const handleInsightNotNow = (id: string) => {
    dismissToday(id, today).then(setDismissals);
  };
  const handleInsightMuteForever = (id: string) => {
    muteForever(id).then(setDismissals);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      habitsQuery.refetch(),
      logsQuery.refetch(),
      waterQuery.refetch(),
      goalsQuery.refetch(),
      medicationsQuery.refetch(),
      medicationLogsQuery.refetch(),
      cycleQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {visibleInsights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MILO'S NOTES</Text>
          {visibleInsights.map((insight) => (
            <MiloInsight
              key={insight.id}
              icon={insight.icon}
              text={insight.text}
              primaryActionLabel={insight.primaryActionLabel}
              onPrimaryAction={insight.onPrimaryAction}
              onNotNow={() => handleInsightNotNow(insight.id)}
              onMuteForever={() => handleInsightMuteForever(insight.id)}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>HABITS</Text>
        {habitsWithLogs.length === 0 ? (
          <Text style={styles.emptyText}>No habits yet — add one in the Habits tab.</Text>
        ) : (
          habitsWithLogs.map(({ habit, logs: habitLogs }) => (
            <DashboardHabitRow key={habit.id} habit={habit} logs={habitLogs} />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>WATER</Text>
        <DashboardWaterRow
          count={waterCount}
          target={waterTarget}
          settings={waterSettings}
          onAdd={() =>
            setWaterLog.mutate({ date: today, count: waterCount + serving, target: waterTarget })
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>MEDICATIONS</Text>
        {medications.length === 0 ? (
          <Text style={styles.emptyText}>No active medications — add one under More → Medications.</Text>
        ) : (
          medications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              logs={medicationLogs.filter((l) => l.medicationId === medication.id)}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>CYCLE</Text>
        <CycleSummary logs={cycleLogs} settings={cycleSettings} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  section: { gap: spacing.xs },
  sectionLabel: { color: colors.textMuted, fontSize: typography.caption.fontSize, fontWeight: "600", letterSpacing: 0.5 },
  emptyText: { color: colors.textMuted, fontSize: typography.secondary.fontSize },
});
