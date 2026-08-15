import { gte, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { getAnthropicClient, CLAUDE_MODEL } from "./anthropic";
import { habits, habitLogs, reminders, waterLogs, moodLogs, goals, journalEntries } from "@shared/schema";

const digestResultSchema = z.object({
  headline: z.string().min(1),
  highlight: z.string().nullable(),
  sections: z
    .array(
      z.object({
        label: z.string().min(1),
        detail: z.string().min(1),
      }),
    )
    .max(6),
});

export type DigestResult = z.infer<typeof digestResultSchema>;

const DIGEST_TOOL = {
  name: "write_digest",
  description: "Write a structured digest summarizing the user's recent activity.",
  input_schema: {
    type: "object" as const,
    properties: {
      headline: {
        type: "string",
        description: "One short, warm sentence framing the period overall (e.g. 'Solid day — 3/4 habits done, water on track.').",
      },
      highlight: {
        type: "string",
        description:
          "One standout note worth calling out (a streak, a missed habit, low water intake, a notable mood pattern), or null if nothing stands out.",
      },
      sections: {
        type: "array",
        description: "One entry per category that has data — skip categories with nothing to report.",
        items: {
          type: "object",
          properties: {
            label: { type: "string", description: "Category name, e.g. 'Habits', 'Reminders', 'Water', 'Mood', 'Goals'." },
            detail: { type: "string", description: "One short sentence summarizing that category, with concrete numbers where relevant." },
          },
          required: ["label", "detail"],
        },
      },
    },
    required: ["headline", "highlight", "sections"],
  },
};

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

export async function generateDigest(period: "daily" | "weekly"): Promise<DigestResult> {
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

  const prompt = `You are Milo, a friendly personal assistant app. Write a structured ${period} digest
summarizing the user's recent activity below by calling the write_digest tool exactly once. Do
not invent data that isn't listed below.

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
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
    tools: [DIGEST_TOOL],
    tool_choice: { type: "tool", name: "write_digest" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude didn't return a structured digest.");
  }

  const parsed = digestResultSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Couldn't parse the digest: ${parsed.error.message}`);
  }
  return parsed.data;
}
