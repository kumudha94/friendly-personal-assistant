import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../hooks/useHabits";
import { useHabitLogs } from "../hooks/useHabitLogs";
import { useReminders } from "../hooks/useReminders";
import { useWaterLogs } from "../hooks/useWater";
import { useFinanceSnapshot } from "../hooks/useFinanceLink";
import { useKitchenSnapshot } from "../hooks/useKitchen";
import { navigate } from "../navigation/navigationRef";
import { todayStr } from "../utils/date";
import { todayWeekDay } from "../utils/weekday";
import { MEAL_SLOT_LABEL, mealLabel, nextMealSlot } from "../utils/meal";
import type { KitchenSnapshot } from "../types";
import DashboardReminderRow from "../components/DashboardReminderRow";
import EmptyState from "../components/EmptyState";
import HomeCard from "../components/HomeCard";
import MiloCore from "../components/milo/MiloCore";
import MiloSheet from "../components/milo/MiloSheet";
import PlanEveningSheet from "../components/milo/PlanEveningSheet";
import { getProfile } from "../lib/settings";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";

const DEFAULT_WATER_TARGET = 8;

function greeting(name: string): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${timeGreeting}, ${name}` : timeGreeting;
}

function kitchenStatusText(snapshot: KitchenSnapshot | undefined): string {
  if (!snapshot) return "Loading...";
  if (!("meals" in snapshot)) return "Tap to connect";
  const slot = nextMealSlot();
  if (!slot) return "Today's meals are done";
  const entry = snapshot.meals.find((m) => m.slot === slot);
  const label = mealLabel(entry);
  return `Next: ${MEAL_SLOT_LABEL[slot]} — ${label ?? "nothing planned yet"}`;
}

export default function DashboardScreen() {
  const habitsQuery = useHabits();
  const logsQuery = useHabitLogs();
  const remindersQuery = useReminders();
  const waterQuery = useWaterLogs();
  const financeQuery = useFinanceSnapshot();
  const kitchenQuery = useKitchenSnapshot(todayStr());
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    getProfile().then((profile) => setName(profile.name));
  }, []);

  const isLoading =
    habitsQuery.isLoading || logsQuery.isLoading || remindersQuery.isLoading || waterQuery.isLoading;
  const isError =
    habitsQuery.isError || logsQuery.isError || remindersQuery.isError || waterQuery.isError;

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

  const today = todayStr();
  const weekday = todayWeekDay();
  const currentTime = format(new Date(), "HH:mm");

  const todayWaterLog = waterLogs.find((l) => l.date === today);
  const waterCount = todayWaterLog?.count ?? 0;
  const waterTarget = todayWaterLog?.target ?? DEFAULT_WATER_TARGET;

  const completedToday = habits.filter((habit) =>
    logs.find((l) => l.habitId === habit.id && l.date === today)?.completed,
  ).length;

  const todaysReminders = reminders
    .filter((r) => r.active && (r.repeatDays.length === 0 || r.repeatDays.includes(weekday)))
    .sort((a, b) => a.time.localeCompare(b.time));

  const upcoming = todaysReminders.filter((r) => r.time >= currentTime);
  const upNext = upcoming[0];
  const later = upcoming.slice(1);

  const hasNothingYet = habits.length === 0 && reminders.length === 0;

  const personalStatus = `${completedToday}/${habits.length} habits · ${waterCount}/${waterTarget} water`;

  const financeSnapshot = financeQuery.data;
  const financeStatus =
    financeSnapshot?.linked && financeSnapshot.items.length > 0
      ? `${financeSnapshot.items.length} bill${financeSnapshot.items.length === 1 ? "" : "s"} due · ₹${financeSnapshot.totalDue.toLocaleString("en-IN")}`
      : financeSnapshot?.linked
        ? "No bills due this month"
        : "Tap to connect";

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      habitsQuery.refetch(),
      logsQuery.refetch(),
      remindersQuery.refetch(),
      waterQuery.refetch(),
      financeQuery.refetch(),
      kitchenQuery.refetch(),
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
      )}

      <View style={styles.cardsSection}>
        <HomeCard
          icon="person-circle-outline"
          title="My Personal"
          status={personalStatus}
          onPress={() => navigate("More", { screen: "Personal" })}
        />
        <HomeCard
          icon="wallet-outline"
          title="My Finance"
          status={financeStatus}
          onPress={() => navigate("More", { screen: "Finance" })}
        />
        <HomeCard
          icon="restaurant-outline"
          title="My Kitchen"
          status={kitchenStatusText(kitchenQuery.data)}
          gradient
          onPress={() => navigate("More", { screen: "Kitchen" })}
        />
      </View>

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
  cardsSection: { gap: spacing.sm },
});
