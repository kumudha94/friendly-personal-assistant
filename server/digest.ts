import { gte, eq } from "drizzle-orm";
import { db } from "./db";
import { getAnthropicClient, CLAUDE_MODEL } from "./anthropic";
import { habits, habitLogs, reminders, waterLogs, moodLogs, goals, journalEntries } from "@shared/schema";

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function gatherDigestData(period: "daily" | "weekly") {
  const since = daysAgoStr(period === "daily" ? 0 : 6);

  const [
    allHabits,
    recentHabitLogs,
    activeReminders,
    recentWaterLogs,
    recentMoodLogs,
    openGoals,
    recentJournalEntries,
  ] = await Promise.all([
    db.select().from(habits),
    db.select().from(habitLogs).where(gte(habitLogs.date, since)),
    db.select().from(reminders).where(eq(reminders.active, true)),
    db.select().from(waterLogs).where(gte(waterLogs.date, since)),
    db.select().from(moodLogs).where(gte(moodLogs.date, since)),
    db.select().from(goals).where(eq(goals.completed, false)),
    db.select().from(journalEntries).where(gte(journalEntries.date, since)),
  ]);

  return { allHabits, recentHabitLogs, activeReminders, recentWaterLogs, recentMoodLogs, openGoals, recentJournalEntries };
}

export async function generateDigest(period: "daily" | "weekly"): Promise<string> {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    throw new Error("ANTHROPIC_API_KEY is not configured on this server.");
  }

  const data = await gatherDigestData(period);

  const habitSummary = data.allHabits.map((h) => {
    const logs = data.recentHabitLogs.filter((l) => l.habitId === h.id);
    const completedDays = logs.filter((l) => l.completed).length;
    return `- ${h.name} (${h.frequency}): completed ${completedDays}/${logs.length || 0} logged day(s) in range`;
  });

  const reminderSummary = data.activeReminders.map(
    (r) => `- ${r.title} at ${r.time}${r.repeatDays.length ? ` (repeats: ${r.repeatDays.join(", ")})` : " (one-time)"}`,
  );

  const waterSummary = data.recentWaterLogs.map((w) => `- ${w.date}: ${w.count}/${w.target} glasses`);

  const moodSummary = data.recentMoodLogs.map(
    (m) => `- ${m.date}: mood ${m.moodScale}/5, energy ${m.energyLevel}/5, sleep ${m.sleepHours}h${m.notes ? `, notes: "${m.notes}"` : ""}`,
  );

  const goalSummary = data.openGoals.map(
    (g) => `- ${g.title}${g.targetDate ? ` (target ${g.targetDate})` : ""}${g.description ? `: ${g.description}` : ""}`,
  );

  const journalSummary = data.recentJournalEntries.map((j) => `- [${j.type}, ${j.date}] ${j.content}`);

  const prompt = `You are Milo, a friendly personal assistant app. Write a short, warm ${period} digest
(2-4 sentences, plain text, no markdown headers) summarizing the user's recent activity below.
Mention concrete numbers where relevant, call out anything that stands out (streaks, missed
habits, low water intake, notable mood patterns), and end with one encouraging, specific note for
what's ahead. Do not invent data that isn't listed below.

Habits:
${habitSummary.join("\n") || "(none tracked)"}

Active reminders:
${reminderSummary.join("\n") || "(none)"}

Water intake:
${waterSummary.join("\n") || "(no logs in range)"}

Mood/energy/sleep check-ins:
${moodSummary.join("\n") || "(no check-ins in range)"}

Open goals:
${goalSummary.join("\n") || "(none)"}

Journal entries:
${journalSummary.join("\n") || "(none in range)"}`;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "";
}
