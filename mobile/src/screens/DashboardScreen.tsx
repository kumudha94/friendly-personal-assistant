import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../hooks/useHabits";
import { useHabitLogs } from "../hooks/useHabitLogs";
import { useReminders } from "../hooks/useReminders";
import { useWaterLogs, useSetWaterLog } from "../hooks/useWater";
import { useGoals } from "../hooks/useGoals";
import { useMedications } from "../hooks/useMedications";
import { calculateStreak } from "../utils/streak";
import { todayStr } from "../utils/date";
import { todayWeekDay } from "../utils/weekday";
import DashboardStats from "../components/DashboardStats";
import DashboardHabitRow from "../components/DashboardHabitRow";
import DashboardReminderRow from "../components/DashboardReminderRow";
import DashboardWaterRow from "../components/DashboardWaterRow";
import EmptyState from "../components/EmptyState";
import MiloCore from "../components/milo/MiloCore";
import MiloSheet from "../components/milo/MiloSheet";
import PlanEveningSheet from "../components/milo/PlanEveningSheet";
import MiloInsight from "../components/milo/MiloInsight";
import { dismissToday, getDismissals, isDismissed, muteForever, type Dismissals } from "../lib/insights";
import { getProfile } from "../lib/settings";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";

const DEFAULT_WATER_TARGET = 8;

function greeting(name: string): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${timeGreeting}, ${name}` : timeGreeting;
}

function relativeDateLabel(dateStr: string): string {
  const days = differenceInCalendarDays(parseISO(dateStr), new Date());
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

export default function DashboardScreen() {
  const habitsQuery = useHabits();
  const logsQuery = useHabitLogs();
  const remindersQuery = useReminders();
  const waterQuery = useWaterLogs();
  const goalsQuery = useGoals();
  const medicationsQuery = useMedications();
  const setWaterLog = useSetWaterLog();
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [dismissals, setDismissals] = useState<Dismissals>({});
  const [name, setName] = useState("");

  useEffect(() => {
    getDismissals().then(setDismissals);
    getProfile().then((profile) => setName(profile.name));
  }, []);

  const isLoading =
    habitsQuery.isLoading ||
    logsQuery.isLoading ||
    remindersQuery.isLoading ||
    waterQuery.isLoading ||
    goalsQuery.isLoading ||
    medicationsQuery.isLoading;
  const isError =
    habitsQuery.isError ||
    logsQuery.isError ||
    remindersQuery.isError ||
    waterQuery.isError ||
    goalsQuery.isError ||
    medicationsQuery.isError;

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
        <Text style={styles.errorText}>Milo couldn't load your day. Pull down to retry.</Text>
      </View>
    );
  }

  const habits = habitsQuery.data ?? [];
  const logs = logsQuery.data ?? [];
  const reminders = remindersQuery.data ?? [];
  const waterLogs = waterQuery.data ?? [];
  const goals = goalsQuery.data ?? [];
  const medications = medicationsQuery.data ?? [];

  const today = todayStr();
  const weekday = todayWeekDay();
  const currentTime = format(new Date(), "HH:mm");

  const todayWaterLog = waterLogs.find((l) => l.date === today);
  const waterCount = todayWaterLog?.count ?? 0;
  const waterTarget = todayWaterLog?.target ?? DEFAULT_WATER_TARGET;

  const habitsWithLogs = habits.map((habit) => ({
    habit,
    logs: logs.filter((l) => l.habitId === habit.id),
  }));
  const completedToday = habitsWithLogs.filter(
    ({ logs: habitLogs }) => habitLogs.find((l) => l.date === today)?.completed,
  ).length;
  const streaks = habitsWithLogs.map(({ habit, logs: habitLogs }) => ({
    habit,
    streak: calculateStreak(habitLogs),
  }));
  const longestStreak = streaks.reduce((max, s) => Math.max(max, s.streak), 0);
  const topStreak = streaks.reduce((best, s) => (s.streak > (best?.streak ?? 0) ? s : best), streaks[0]);

  const todaysReminders = reminders
    .filter((r) => r.active && (r.repeatDays.length === 0 || r.repeatDays.includes(weekday)))
    .sort((a, b) => a.time.localeCompare(b.time));

  const upcoming = todaysReminders.filter((r) => r.time >= currentTime);
  const upNext = upcoming[0];
  const later = upcoming.slice(1);

  const hasNothingYet = habits.length === 0 && reminders.length === 0;

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
    .filter((g) => !g.completed && g.targetDate && differenceInCalendarDays(parseISO(g.targetDate), new Date()) <= 7 && differenceInCalendarDays(parseISO(g.targetDate), new Date()) >= 0)
    .sort((a, b) => (a.targetDate ?? "").localeCompare(b.targetDate ?? ""))[0];
  if (upcomingGoal && upcomingGoal.targetDate) {
    allInsights.push({
      id: `goal-${upcomingGoal.id}`,
      icon: "🎯",
      text: `${upcomingGoal.title} — due ${relativeDateLabel(upcomingGoal.targetDate)}`,
    });
  }
  const lowMedication = medications.find((m) => m.active && m.quantityRemaining <= m.refillThreshold);
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
      remindersQuery.refetch(),
      waterQuery.refetch(),
      goalsQuery.refetch(),
      medicationsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      <View style={styles.heroHeader}>
        <View>
          <Text style={styles.greeting}>{greeting(name)}</Text>
          <Text style={styles.dateHeading}>{format(new Date(), "EEEE, MMM d")}</Text>
        </View>
      </View>

      <View style={styles.coreBlock}>
        <MiloCore state="idle" size={44} />
        <TouchableOpacity style={styles.talkButton} onPress={() => setSheetOpen(true)}>
          <Ionicons name="mic-outline" size={16} color={colors.textPrimary} />
          <Text style={styles.talkButtonText}>Talk to Milo</Text>
        </TouchableOpacity>
      </View>

      {hasNothingYet ? (
        <EmptyState
          title="Nothing planned yet."
          subtitle="A quiet day. Enjoy it :)"
          actionLabel="Add something"
          onAction={() => setSheetOpen(true)}
        />
      ) : (
        <>
          <DashboardStats
            completedToday={completedToday}
            totalHabits={habits.length}
            longestStreak={longestStreak}
          />

          <DashboardWaterRow
            count={waterCount}
            target={waterTarget}
            onAddGlass={() =>
              setWaterLog.mutate({ date: today, count: waterCount + 1, target: waterTarget })
            }
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOUR DAY</Text>

            <View style={styles.timelineBlock}>
              <Text style={styles.timelineLabel}>NOW</Text>
              <Text style={styles.timelineValue}>
                {upNext ? `Up next at ${upNext.time}` : "Nothing urgent"}
              </Text>
            </View>

            {upNext && (
              <View style={styles.timelineBlock}>
                <Text style={styles.timelineLabel}>UP NEXT</Text>
                <DashboardReminderRow reminder={upNext} />
              </View>
            )}

            {later.length > 0 && (
              <View style={styles.timelineBlock}>
                <Text style={styles.timelineLabel}>LATER</Text>
                {later.map((reminder) => (
                  <DashboardReminderRow key={reminder.id} reminder={reminder} />
                ))}
              </View>
            )}
          </View>

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
        </>
      )}

      <MiloSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onPlanEvening={() => {
          setSheetOpen(false);
          setPlanSheetOpen(true);
        }}
      />
      <PlanEveningSheet visible={planSheetOpen} onClose={() => setPlanSheetOpen(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  heroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { color: colors.textSecondary, fontSize: typography.secondary.fontSize },
  dateHeading: { color: colors.textPrimary, fontSize: typography.screenTitle.fontSize, fontWeight: "700" },
  coreBlock: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm },
  talkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.control,
    backgroundColor: colors.accent,
  },
  talkButtonText: { color: colors.textPrimary, fontWeight: "600", fontSize: typography.secondary.fontSize },
  section: { gap: spacing.xs },
  sectionLabel: { color: colors.textMuted, fontSize: typography.caption.fontSize, fontWeight: "600", letterSpacing: 0.5 },
  timelineBlock: { gap: 2, marginBottom: spacing.xs },
  timelineLabel: { color: colors.textMuted, fontSize: typography.caption.fontSize, fontWeight: "600" },
  timelineValue: { color: colors.textPrimary, fontSize: typography.body.fontSize },
  emptyText: { color: colors.textMuted, fontSize: typography.secondary.fontSize },
});
