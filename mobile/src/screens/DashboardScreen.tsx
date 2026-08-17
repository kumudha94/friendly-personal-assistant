import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../hooks/useHabits";
import { useHabitLogs, useToggleHabitLog } from "../hooks/useHabitLogs";
import { useReminders } from "../hooks/useReminders";
import { useWaterLogs, useSetWaterLog } from "../hooks/useWater";
import { useGoals } from "../hooks/useGoals";
import { useCycleLogs } from "../hooks/useCycle";
import { useFinanceSnapshot } from "../hooks/useFinanceLink";
import { useKitchenSnapshot } from "../hooks/useKitchen";
import { useWeatherSnapshot } from "../hooks/useWeather";
import { navigate } from "../navigation/navigationRef";
import { todayStr } from "../utils/date";
import { todayWeekDay } from "../utils/weekday";
import { MEAL_SLOT_LABEL, mealLabel, nextMealSlot, type MealSlot } from "../utils/meal";
import { buildBrief, computeInsights, type BriefTimelineItem } from "../lib/miloInsights";
import { weatherEmoji } from "../lib/weather";
import { dismissToday, getDismissals, isDismissed, muteForever, type Dismissals } from "../lib/insights";
import type { Profile } from "../lib/settings";
import EmptyState from "../components/EmptyState";
import GradientCard from "../components/GradientCard";
import MiloCore from "../components/milo/MiloCore";
import MiloSheet from "../components/milo/MiloSheet";
import MiloInsight from "../components/milo/MiloInsight";
import PlanEveningSheet from "../components/milo/PlanEveningSheet";
import { getProfile } from "../lib/settings";
import { DEFAULT_WATER_SETTINGS, formatWaterCompact, getWaterSettings, servingMl, type WaterSettings } from "../lib/waterSettings";
import { DEFAULT_CYCLE_SETTINGS, getCycleSettings, type CycleSettings } from "../lib/cycleSettings";
import { getBalanceHidden, setBalanceHidden } from "../lib/balancePrivacy";
import { renderHighlighted } from "../lib/highlightText";
import { colors, gradients, MILO_BAR_CLEARANCE, spacing, typography } from "../theme/tokens";

const MEAL_SLOT_TIME: Record<MealSlot, string> = { breakfast: "08:00", lunch: "13:00", dinner: "19:00" };
const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"];

function formatAmount(amount: number, hidden: boolean): string {
  return hidden ? "₹••••••" : `₹${amount.toLocaleString("en-IN")}`;
}

function greeting(name: string): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${timeGreeting}, ${name}` : timeGreeting;
}

export default function DashboardScreen() {
  const habitsQuery = useHabits();
  const logsQuery = useHabitLogs();
  const remindersQuery = useReminders();
  const waterQuery = useWaterLogs();
  const goalsQuery = useGoals();
  const cycleQuery = useCycleLogs();
  const financeQuery = useFinanceSnapshot();
  const kitchenQuery = useKitchenSnapshot(todayStr());
  const toggleHabitLog = useToggleHabitLog();
  const setWaterLog = useSetWaterLog();
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dismissals, setDismissals] = useState<Dismissals>({});
  const [waterSettings, setWaterSettingsState] = useState<WaterSettings>(DEFAULT_WATER_SETTINGS);
  const [cycleSettings, setCycleSettingsState] = useState<CycleSettings>(DEFAULT_CYCLE_SETTINGS);
  const [balanceHidden, setBalanceHiddenState] = useState(false);

  const weatherQuery = useWeatherSnapshot(profile?.homeLocation || undefined);

  useEffect(() => {
    getProfile().then(setProfile);
    getDismissals().then(setDismissals);
    getWaterSettings().then(setWaterSettingsState);
    getBalanceHidden().then(setBalanceHiddenState);
    getCycleSettings().then(setCycleSettingsState);
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
  const goals = goalsQuery.data ?? [];
  const cycleLogs = cycleQuery.data ?? [];

  const today = todayStr();
  const weekday = todayWeekDay();
  const currentTime = format(new Date(), "HH:mm");

  const todayWaterLog = waterLogs.find((l) => l.date === today);
  const waterCount = todayWaterLog?.count ?? 0;
  const waterTarget = todayWaterLog?.target ?? waterSettings.targetMl;
  const waterServing = servingMl(waterSettings);

  const completedToday = habits.filter((habit) =>
    logs.find((l) => l.habitId === habit.id && l.date === today)?.completed,
  ).length;
  const incompleteHabits = habits.filter(
    (habit) => !logs.find((l) => l.habitId === habit.id && l.date === today)?.completed,
  );

  const financeSnapshot = financeQuery.data;
  const kitchenSnapshot = kitchenQuery.data;
  const weatherSnapshot = weatherQuery.data;

  const allInsights = computeInsights({
    habits,
    habitLogs: logs,
    waterCount,
    waterTarget,
    onLogWater: () => setWaterLog.mutate({ date: today, count: waterCount + waterServing, target: waterTarget }),
    goals,
    kitchenSnapshot,
    waterSettings,
    cycleLogs,
    cycleSettings,
  });
  const visibleInsights = allInsights.filter((insight) => !isDismissed(dismissals, insight.id, today));
  const topInsight = visibleInsights[0];

  // Merged Today timeline — reminders (exact time) + planned meals (a representative time per
  // slot, since meal plans only carry a slot, not a clock time), upcoming-only, chronological.
  const timelineItems: BriefTimelineItem[] = [
    ...reminders
      .filter((r) => r.active && (r.repeatDays.length === 0 || r.repeatDays.includes(weekday)))
      .map((r) => ({ title: r.title, time: r.time, icon: "⏰" })),
    ...(kitchenSnapshot && "meals" in kitchenSnapshot
      ? MEAL_SLOTS.filter((slot) => mealLabel(kitchenSnapshot.meals.find((m) => m.slot === slot))).map((slot) => ({
          title: mealLabel(kitchenSnapshot.meals.find((m) => m.slot === slot))!,
          time: MEAL_SLOT_TIME[slot],
          icon: "🍽",
        }))
      : []),
  ]
    .filter((item) => item.time >= currentTime)
    .sort((a, b) => a.time.localeCompare(b.time));

  const attentionCount = visibleInsights.length + timelineItems.length;
  const briefMessage = buildBrief({
    weather: weatherSnapshot,
    nextTimelineItem: timelineItems[0],
    attentionCount,
  });

  const nextMeal = (() => {
    if (!kitchenSnapshot || !("meals" in kitchenSnapshot)) return null;
    const slot = nextMealSlot() ?? "dinner";
    const entry = kitchenSnapshot.meals.find((m) => m.slot === slot);
    return { slot, entry, label: mealLabel(entry) };
  })();

  // Earliest-due unpaid item across every category, for the Money card's single preview row.
  const nextBill = financeSnapshot?.linked
    ? Object.values(financeSnapshot.categories)
        .flatMap((c) => c.items)
        .filter((item) => !item.isPaid && item.dueDate)
        .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))[0]
    : undefined;

  function toggleBalanceHidden() {
    const next = !balanceHidden;
    setBalanceHiddenState(next);
    setBalanceHidden(next);
  }

  function handleQuickWater() {
    setWaterLog.mutate({ date: today, count: waterCount + waterServing, target: waterTarget });
  }

  function handleQuickHabit() {
    if (incompleteHabits.length === 1) {
      toggleHabitLog.mutate({ habitId: incompleteHabits[0].id, date: today, completed: true });
    } else {
      navigate("Habits");
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      habitsQuery.refetch(),
      logsQuery.refetch(),
      remindersQuery.refetch(),
      waterQuery.refetch(),
      goalsQuery.refetch(),
      cycleQuery.refetch(),
      financeQuery.refetch(),
      kitchenQuery.refetch(),
      weatherQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* Milo Brief — single voice: weather (only when actionable) + what's next, or a fallback */}
      <View style={styles.briefBlock}>
        <Text style={styles.greeting}>{greeting(profile?.name ?? "")}</Text>
        <Text style={styles.dateHeading}>{format(new Date(), "EEEE, MMM d")}</Text>
        <TouchableOpacity style={styles.coreTap} onPress={() => setSheetOpen(true)}>
          <MiloCore state="idle" size={44} />
        </TouchableOpacity>
        {weatherSnapshot?.configured && (
          <GradientCard colors={gradients.weatherChip} style={styles.weatherChipInner}>
            <Text style={styles.weatherLine}>
              {weatherEmoji(weatherSnapshot.condition)}{" "}
              {renderHighlighted(`${weatherSnapshot.tempC}°C · ${weatherSnapshot.description}`)}
            </Text>
          </GradientCard>
        )}
        <Text style={styles.briefMessage}>{renderHighlighted(briefMessage)}</Text>
      </View>

      {/* Money — equal billing with Home and Personal, not buried behind a chip */}
      {financeSnapshot?.linked && (
        <GradientCard style={styles.card} onPress={() => navigate("More", { screen: "Finance" })}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>💰 MONEY</Text>
            <TouchableOpacity onPress={toggleBalanceHidden} hitSlop={8}>
              <Ionicons
                name={balanceHidden ? "eye-off-outline" : "eye-outline"}
                size={16}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardBigNumber}>{formatAmount(financeSnapshot.balance, balanceHidden)}</Text>
          <Text style={styles.cardSubtext}>Current balance</Text>
          <Text style={styles.cardMeta}>{formatAmount(financeSnapshot.totalDue, balanceHidden)} due this cycle</Text>
          {nextBill && (
            <View style={styles.cardRow}>
              <Text style={styles.cardRowLabel} numberOfLines={1}>{nextBill.label}</Text>
              <Text style={styles.cardRowValue}>{formatAmount(nextBill.amount, balanceHidden)}</Text>
            </View>
          )}
          <Text style={styles.cardLink}>View Finance</Text>
        </GradientCard>
      )}

      {/* Home — kitchen/meal status */}
      {nextMeal && (
        <GradientCard style={styles.card} onPress={() => navigate("More", { screen: "Kitchen" })}>
          <Text style={styles.cardLabel}>🏠 HOME · {nextMeal.slot === "dinner" ? "TONIGHT" : MEAL_SLOT_LABEL[nextMeal.slot].toUpperCase()}</Text>
          {nextMeal.label ? (
            <>
              <Text style={styles.cardBigText}>{nextMeal.label}</Text>
              {nextMeal.entry?.recipe?.prepTimeMinutes != null && (
                <Text style={styles.cardMeta}>⏱ {nextMeal.entry.recipe.prepTimeMinutes} min</Text>
              )}
              <Text style={styles.cardLink}>View Meal</Text>
            </>
          ) : (
            <>
              <Text style={styles.cardSubtext}>Nothing planned yet.</Text>
              <Text style={styles.cardLink}>Plan {MEAL_SLOT_LABEL[nextMeal.slot]}</Text>
            </>
          )}
        </GradientCard>
      )}

      {/* Personal — habits + water get the same billing as Money and Home, not buried in More */}
      <GradientCard style={styles.card} onPress={() => navigate("More", { screen: "Personal" })}>
        <Text style={styles.cardLabel}>🧍 PERSONAL</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardRowLabel}>✓ Habits</Text>
          <Text style={styles.cardRowValue}>{completedToday}/{habits.length}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardRowLabel}>💧 Water</Text>
          <Text style={styles.cardRowValue}>
            {formatWaterCompact(waterCount, waterSettings)}/{formatWaterCompact(waterTarget, waterSettings)}
          </Text>
        </View>
        <Text style={styles.cardLink}>View Personal</Text>
      </GradientCard>

      {/* Milo Suggests — the one thing worth acting on, with real actions (unlike the brief above) */}
      {topInsight && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>✨ MILO SUGGESTS</Text>
          <MiloInsight
            icon={topInsight.icon}
            text={topInsight.text}
            primaryActionLabel={topInsight.primaryActionLabel}
            onPrimaryAction={topInsight.onPrimaryAction}
            onNotNow={() => dismissToday(topInsight.id, today).then(setDismissals)}
            onMuteForever={() => muteForever(topInsight.id).then(setDismissals)}
          />
        </View>
      )}

      {/* Today — merged chronological timeline, replaces the single "Up next" line */}
      {timelineItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>📌 TODAY</Text>
          {timelineItems.map((item, i) => (
            <View key={`${item.time}-${i}`} style={styles.timelineRow}>
              <Text style={styles.timelineTime}>{item.time}</Text>
              <Text style={styles.timelineTitle}>{item.icon} {item.title}</Text>
            </View>
          ))}
        </View>
      )}

      {habits.length === 0 && reminders.length === 0 && !financeSnapshot?.linked && !nextMeal && (
        <EmptyState
          title="Nothing planned yet."
          subtitle="A quiet day. Enjoy it :)"
          actionLabel="Add something"
          onAction={() => setSheetOpen(true)}
        />
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.quickActionsRow}>
          <View style={styles.quickActionSlot}>
            <GradientCard style={styles.quickAction} onPress={handleQuickWater}>
              <Ionicons name="water-outline" size={18} color={colors.accent} />
              <Text style={styles.quickActionText}>Water</Text>
            </GradientCard>
          </View>
          <View style={styles.quickActionSlot}>
            <GradientCard style={styles.quickAction} onPress={handleQuickHabit}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.accent} />
              <Text style={styles.quickActionText}>Habit</Text>
            </GradientCard>
          </View>
          <View style={styles.quickActionSlot}>
            <GradientCard style={styles.quickAction} onPress={() => navigate("More", { screen: "Kitchen" })}>
              <Ionicons name="restaurant-outline" size={18} color={colors.accent} />
              <Text style={styles.quickActionText}>Dinner</Text>
            </GradientCard>
          </View>
          <View style={styles.quickActionSlot}>
            <GradientCard style={styles.quickAction} onPress={() => setSheetOpen(true)}>
              <Ionicons name="alarm-outline" size={18} color={colors.accent} />
              <Text style={styles.quickActionText}>Reminder</Text>
            </GradientCard>
          </View>
        </View>
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
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.md + MILO_BAR_CLEARANCE },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },

  briefBlock: { alignItems: "center", gap: spacing.xs, paddingVertical: spacing.md },
  greeting: { color: colors.textPrimary, fontSize: typography.hero.fontSize, fontWeight: "700" },
  dateHeading: { color: colors.textSecondary, fontSize: typography.body.fontSize },
  coreTap: { paddingVertical: spacing.sm },
  weatherChipInner: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  weatherLine: { color: colors.textPrimary, fontSize: typography.secondary.fontSize, fontWeight: "500" },
  briefMessage: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },

  section: { gap: spacing.xs },
  sectionLabel: { color: colors.textMuted, fontSize: typography.caption.fontSize, fontWeight: "600", letterSpacing: 1 },

  timelineRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: 2 },
  timelineTime: { color: colors.textMuted, fontSize: typography.secondary.fontSize, width: 52 },
  timelineTitle: { color: colors.textPrimary, fontSize: typography.body.fontSize, flex: 1 },

  card: {
    padding: spacing.md,
    gap: 2,
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardLabel: { color: colors.textMuted, fontSize: typography.caption.fontSize, fontWeight: "600", letterSpacing: 0.5, marginBottom: 4 },
  cardBigNumber: { color: colors.textPrimary, fontSize: 28, fontWeight: "700" },
  cardBigText: { color: colors.textPrimary, fontSize: typography.sectionTitle.fontSize, fontWeight: "700" },
  cardSubtext: { color: colors.textMuted, fontSize: typography.caption.fontSize },
  cardMeta: { color: colors.textSecondary, fontSize: typography.secondary.fontSize, marginTop: 2 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xs },
  cardRowLabel: { color: colors.textSecondary, fontSize: typography.secondary.fontSize, flex: 1 },
  cardRowValue: { color: colors.textPrimary, fontSize: typography.secondary.fontSize, fontWeight: "600" },
  cardLink: { color: colors.accent, fontSize: typography.caption.fontSize, fontWeight: "600", marginTop: spacing.sm },

  quickActionsRow: { flexDirection: "row", gap: spacing.xs },
  quickActionSlot: { flex: 1 },
  quickAction: {
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.sm,
  },
  quickActionText: { color: colors.textSecondary, fontSize: typography.caption.fontSize, fontWeight: "600" },
});
