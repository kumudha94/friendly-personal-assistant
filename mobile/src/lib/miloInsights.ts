import { differenceInCalendarDays, parseISO } from "date-fns";
import { calculateStreak } from "../utils/streak";
import { nextMealSlot, mealLabel } from "../utils/meal";
import { predictNextStartFromCycleLength } from "../utils/cycle";
import { DEFAULT_WATER_SETTINGS, formatWaterAmount, type WaterSettings } from "./waterSettings";
import { DEFAULT_CYCLE_SETTINGS, type CycleSettings } from "./cycleSettings";
import { weatherAdvice } from "./weather";
import type { CycleLog, Goal, Habit, HabitLog, KitchenSnapshot, WeatherSnapshot } from "../types";

export type MiloInsightData = {
  id: string;
  icon: string;
  text: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
};

function relativeDateLabel(dateStr: string): string {
  const days = differenceInCalendarDays(parseISO(dateStr), new Date());
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

// Shared by PersonalScreen (shows the full list) and DashboardScreen (shows just the
// highest-priority one) — one place computing "what's worth telling the user about" so the
// two screens can't silently drift out of sync on what counts as an insight.
export function computeInsights(data: {
  habits: Habit[];
  habitLogs: HabitLog[];
  waterCount: number;
  waterTarget: number;
  onLogWater?: () => void;
  goals?: Goal[];
  kitchenSnapshot?: KitchenSnapshot;
  waterSettings?: WaterSettings;
  cycleLogs?: CycleLog[];
  cycleSettings?: CycleSettings;
}): MiloInsightData[] {
  const { habits, habitLogs, waterCount, waterTarget, onLogWater, goals, kitchenSnapshot, cycleLogs } = data;
  const waterSettings = data.waterSettings ?? DEFAULT_WATER_SETTINGS;
  const cycleSettings = data.cycleSettings ?? DEFAULT_CYCLE_SETTINGS;
  const insights: MiloInsightData[] = [];

  // Time-sensitive and safety-relevant signals first — these are the ones worth
  // interrupting the user's day for. Positive/celebratory ones (streak) go last.
  if (kitchenSnapshot && "meals" in kitchenSnapshot) {
    const slot = nextMealSlot();
    if (slot === "dinner") {
      const entry = kitchenSnapshot.meals.find((m) => m.slot === slot);
      if (!mealLabel(entry)) {
        insights.push({ id: "kitchen-dinner", icon: "🍽", text: "Dinner isn't planned yet" });
      }
    }
  }

  if (waterCount < waterTarget) {
    insights.push({
      id: "water",
      icon: "💧",
      text: `${formatWaterAmount(waterTarget - waterCount, waterSettings)} left today`,
      primaryActionLabel: onLogWater ? "Log water" : undefined,
      onPrimaryAction: onLogWater,
    });
  }

  const upcomingGoal = (goals ?? [])
    .filter(
      (g) =>
        !g.completed &&
        g.targetDate &&
        differenceInCalendarDays(parseISO(g.targetDate), new Date()) <= 7 &&
        differenceInCalendarDays(parseISO(g.targetDate), new Date()) >= 0,
    )
    .sort((a, b) => (a.targetDate ?? "").localeCompare(b.targetDate ?? ""))[0];
  if (upcomingGoal && upcomingGoal.targetDate) {
    insights.push({
      id: `goal-${upcomingGoal.id}`,
      icon: "🎯",
      text: `${upcomingGoal.title} — due ${relativeDateLabel(upcomingGoal.targetDate)}`,
    });
  }

  const predictedCycleStart = predictNextStartFromCycleLength(
    (cycleLogs ?? []).map((l) => l.startDate),
    cycleSettings.cycleLengthDays,
  );
  if (predictedCycleStart) {
    const days = differenceInCalendarDays(predictedCycleStart, new Date());
    if (days >= 0 && days <= 3) {
      insights.push({
        id: "cycle",
        icon: "🩸",
        text: days === 0 ? "Period expected today" : `Period expected in ${days} day${days === 1 ? "" : "s"}`,
      });
    }
  }

  const habitsWithLogs = habits.map((habit) => ({ habit, logs: habitLogs.filter((l) => l.habitId === habit.id) }));
  const streaks = habitsWithLogs.map(({ habit, logs }) => ({ habit, streak: calculateStreak(logs) }));
  const topStreak = streaks.reduce((best, s) => (s.streak > (best?.streak ?? 0) ? s : best), streaks[0]);
  if (topStreak?.streak >= 3) {
    insights.push({ id: "streak", icon: "🔥", text: `${topStreak.habit.name} — ${topStreak.streak} day streak` });
  }

  return insights;
}

export type BriefTimelineItem = { title: string; time: string; icon: string };

// Composes the single sentence-or-two Milo says at the top of the Dashboard: weather (only
// when it's actionable), then what's next today — falling back to a plain attention-count
// line when neither applies. Deliberately does NOT repeat the top insight's text — that
// already gets its own "Milo Suggests" card with dismiss/action buttons below, and saying
// the same line twice in two different boxes is exactly what felt off about stacking a
// weather box and a brief box that both said "rain, umbrella" (see Group F discussion).
// Rule-based on purpose — instant, free, and reuses signals already computed for the
// chip/card UI rather than calling an LLM on every Dashboard open.
export function buildBrief(data: {
  weather?: WeatherSnapshot;
  nextTimelineItem?: BriefTimelineItem;
  attentionCount: number;
}): string {
  const { weather, nextTimelineItem, attentionCount } = data;
  const sentences: string[] = [];

  if (weather?.configured) {
    const advice = weatherAdvice(weather.condition);
    if (advice) {
      sentences.push(`${weather.tempC}°C and ${weather.description} today — ${advice}.`);
    }
  }

  if (nextTimelineItem) {
    sentences.push(`${nextTimelineItem.title} at ${nextTimelineItem.time}.`);
  }

  if (sentences.length === 0) {
    return attentionCount === 0
      ? "You're all caught up ✨"
      : `You have ${attentionCount} thing${attentionCount === 1 ? "" : "s"} worth your attention.`;
  }

  return sentences.slice(0, 2).join(" ");
}
