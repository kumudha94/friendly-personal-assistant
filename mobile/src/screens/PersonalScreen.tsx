import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { useHabits } from "../hooks/useHabits";
import { useHabitLogs } from "../hooks/useHabitLogs";
import { useWaterLogs, useSetWaterLog } from "../hooks/useWater";
import { useGoals } from "../hooks/useGoals";
import { useMedications, useMedicationLogs } from "../hooks/useMedications";
import { useCycleLogs } from "../hooks/useCycle";
import { calculateStreak } from "../utils/streak";
import { todayStr } from "../utils/date";
import DashboardHabitRow from "../components/DashboardHabitRow";
import DashboardWaterRow from "../components/DashboardWaterRow";
import MedicationCard from "../components/MedicationCard";
import CycleSummary from "../components/CycleSummary";
import MiloInsight from "../components/milo/MiloInsight";
import { colors, MILO_BAR_CLEARANCE, spacing, typography } from "../theme/tokens";
import { dismissToday, getDismissals, isDismissed, muteForever, type Dismissals } from "../lib/insights";

const DEFAULT_WATER_TARGET = 8;

function relativeDateLabel(dateStr: string): string {
  const days = differenceInCalendarDays(parseISO(dateStr), new Date());
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

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

  useEffect(() => {
    getDismissals().then(setDismissals);
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
  const waterTarget = todayWaterLog?.target ?? DEFAULT_WATER_TARGET;

  const habitsWithLogs = habits.map((habit) => ({
    habit,
    logs: logs.filter((l) => l.habitId === habit.id),
  }));
  const streaks = habitsWithLogs.map(({ habit, logs: habitLogs }) => ({
    habit,
    streak: calculateStreak(habitLogs),
  }));
  const topStreak = streaks.reduce((best, s) => (s.streak > (best?.streak ?? 0) ? s : best), streaks[0]);

  const allInsights: {
    id: string;
    icon: string;
    text: string;
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
  }[] = [];
  if (topStreak && topStreak.streak >= 3) {
    allInsights.push({
      id: "streak",
      icon: "🔥",
      text: `${topStreak.habit.name} — ${topStreak.streak} day streak`,
    });
  }
  if (waterCount < waterTarget) {
    allInsights.push({
      id: "water",
      icon: "💧",
      text: `${waterTarget - waterCount} glasses left today`,
      primaryActionLabel: "Log a glass",
      onPrimaryAction: () =>
        setWaterLog.mutate({ date: today, count: waterCount + 1, target: waterTarget }),
    });
  }
  const upcomingGoal = goals
    .filter(
      (g) =>
        !g.completed &&
        g.targetDate &&
        differenceInCalendarDays(parseISO(g.targetDate), new Date()) <= 7 &&
        differenceInCalendarDays(parseISO(g.targetDate), new Date()) >= 0,
    )
    .sort((a, b) => (a.targetDate ?? "").localeCompare(b.targetDate ?? ""))[0];
  if (upcomingGoal && upcomingGoal.targetDate) {
    allInsights.push({
      id: `goal-${upcomingGoal.id}`,
      icon: "🎯",
      text: `${upcomingGoal.title} — due ${relativeDateLabel(upcomingGoal.targetDate)}`,
    });
  }
  const lowMedication = medications.find((m) => m.quantityRemaining <= m.refillThreshold);
  if (lowMedication) {
    allInsights.push({
      id: `medication-${lowMedication.id}`,
      icon: "💊",
      text: `${lowMedication.name} — refill soon`,
    });
  }
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
          onAddGlass={() =>
            setWaterLog.mutate({ date: today, count: waterCount + 1, target: waterTarget })
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
        <CycleSummary logs={cycleLogs} />
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
