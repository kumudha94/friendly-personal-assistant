import { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { format } from "date-fns";
import { useHabits } from "../hooks/useHabits";
import { useHabitLogs } from "../hooks/useHabitLogs";
import { useReminders } from "../hooks/useReminders";
import { useWaterLogs, useSetWaterLog } from "../hooks/useWater";
import { calculateStreak } from "../utils/streak";
import { todayStr } from "../utils/date";
import { todayWeekDay } from "../utils/weekday";
import DashboardStats from "../components/DashboardStats";
import DashboardHabitRow from "../components/DashboardHabitRow";
import DashboardReminderRow from "../components/DashboardReminderRow";
import DashboardWaterRow from "../components/DashboardWaterRow";

const DEFAULT_WATER_TARGET = 8;

export default function DashboardScreen() {
  const habitsQuery = useHabits();
  const logsQuery = useHabitLogs();
  const remindersQuery = useReminders();
  const waterQuery = useWaterLogs();
  const setWaterLog = useSetWaterLog();
  const [refreshing, setRefreshing] = useState(false);

  const isLoading =
    habitsQuery.isLoading || logsQuery.isLoading || remindersQuery.isLoading || waterQuery.isLoading;
  const isError =
    habitsQuery.isError || logsQuery.isError || remindersQuery.isError || waterQuery.isError;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load your dashboard. Pull down to retry.</Text>
      </View>
    );
  }

  const habits = habitsQuery.data ?? [];
  const logs = logsQuery.data ?? [];
  const reminders = remindersQuery.data ?? [];
  const waterLogs = waterQuery.data ?? [];

  const today = todayStr();
  const weekday = todayWeekDay();

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
  const longestStreak = habitsWithLogs.reduce(
    (max, { logs: habitLogs }) => Math.max(max, calculateStreak(habitLogs)),
    0,
  );

  const todaysReminders = reminders
    .filter((r) => r.active && (r.repeatDays.length === 0 || r.repeatDays.includes(weekday)))
    .sort((a, b) => a.time.localeCompare(b.time));

  const hasNothingYet = habits.length === 0 && reminders.length === 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      habitsQuery.refetch(),
      logsQuery.refetch(),
      remindersQuery.refetch(),
      waterQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.dateHeading}>{format(new Date(), "EEEE, MMM d")}</Text>

      <DashboardWaterRow
        count={waterCount}
        target={waterTarget}
        onAddGlass={() =>
          setWaterLog.mutate({ date: today, count: waterCount + 1, target: waterTarget })
        }
      />

      {hasNothingYet ? (
        <View style={styles.welcomeEmpty}>
          <Text style={styles.welcomeTitle}>Welcome to Milo</Text>
          <Text style={styles.welcomeText}>
            Add a habit or a reminder from their tabs below to see them here.
          </Text>
        </View>
      ) : (
        <>
          <DashboardStats
            completedToday={completedToday}
            totalHabits={habits.length}
            longestStreak={longestStreak}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habits</Text>
            {habitsWithLogs.length === 0 ? (
              <Text style={styles.emptyText}>No habits yet — add one in the Habits tab.</Text>
            ) : (
              habitsWithLogs.map(({ habit, logs: habitLogs }) => (
                <DashboardHabitRow key={habit.id} habit={habit} logs={habitLogs} />
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's reminders</Text>
            {todaysReminders.length === 0 ? (
              <Text style={styles.emptyText}>No reminders today.</Text>
            ) : (
              todaysReminders.map((reminder) => (
                <DashboardReminderRow key={reminder.id} reminder={reminder} />
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#dc2626", textAlign: "center", padding: 24 },
  dateHeading: { fontSize: 20, fontWeight: "700", color: "#111" },
  section: { gap: 4 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 4 },
  emptyText: { fontSize: 13, color: "#999" },
  welcomeEmpty: { paddingVertical: 48, alignItems: "center", gap: 8 },
  welcomeTitle: { fontSize: 18, fontWeight: "700" },
  welcomeText: { fontSize: 13, color: "#999", textAlign: "center", paddingHorizontal: 24 },
});
