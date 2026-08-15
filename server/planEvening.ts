import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { getAnthropicClient, CLAUDE_MODEL } from "./anthropic";
import { habits, habitLogs, reminders, goals } from "@shared/schema";

const planEveningResultSchema = z.object({
  summary: z.string().min(1),
  items: z
    .array(
      z.object({
        time: z.string().regex(/^\d{2}:\d{2}$/),
        title: z.string().min(1),
      }),
    )
    .max(6),
});

export type PlanEveningResult = z.infer<typeof planEveningResultSchema>;

const PLAN_EVENING_TOOL = {
  name: "propose_evening_plan",
  description: "Propose a short evening plan as an ordered list of suggested reminder items.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: { type: "string", description: "One short, warm sentence framing the evening plan." },
      items: {
        type: "array",
        description: "Up to 6 suggested items for the rest of the evening, in chronological order.",
        items: {
          type: "object",
          properties: {
            time: { type: "string", description: "24-hour HH:mm time for this item." },
            title: { type: "string", description: "Short title for this item." },
          },
          required: ["time", "title"],
        },
      },
    },
    required: ["summary", "items"],
  },
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

async function gatherEveningData() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const today = todayStr();

  const [allReminders, allHabits, todayHabitLogs, openGoals] = await Promise.all([
    db.select().from(reminders).where(eq(reminders.active, true)),
    db.select().from(habits),
    db.select().from(habitLogs).where(eq(habitLogs.date, today)),
    db.select().from(goals).where(eq(goals.completed, false)),
  ]);

  const remainingReminders = allReminders.filter((r) => r.time >= currentTime);
  const completedHabitIds = new Set(
    todayHabitLogs.filter((l) => l.completed).map((l) => l.habitId),
  );
  const incompleteHabits = allHabits.filter((h) => !completedHabitIds.has(h.id));

  return { currentTime, remainingReminders, incompleteHabits, openGoals };
}

export async function planEvening(): Promise<PlanEveningResult> {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    throw new Error("ANTHROPIC_API_KEY is not configured on this server.");
  }

  const data = await gatherEveningData();

  const reminderSummary = data.remainingReminders.map((r) => `- ${r.title} at ${r.time}`);
  const habitSummary = data.incompleteHabits.map((h) => `- ${h.name} (${h.frequency}, not done yet today)`);
  const goalSummary = data.openGoals.map(
    (g) => `- ${g.title}${g.targetDate ? ` (target ${g.targetDate})` : ""}`,
  );

  const prompt = `You are Milo, a friendly personal assistant app. It's currently ${data.currentTime}.
Propose a short, realistic plan for the rest of the user's evening by calling the
propose_evening_plan tool exactly once. Base it only on the data below — don't invent tasks that
aren't implied by it. Prioritize any remaining reminders at their existing times, then suggest
slots for incomplete habits, then leave room to acknowledge open goals if relevant. Keep it to a
handful of items — this should feel calm, not like a packed schedule.

Remaining reminders tonight:
${reminderSummary.join("\n") || "(none)"}

Habits not yet done today:
${habitSummary.join("\n") || "(none)"}

Open goals:
${goalSummary.join("\n") || "(none)"}`;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
    tools: [PLAN_EVENING_TOOL],
    tool_choice: { type: "tool", name: "propose_evening_plan" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude didn't return a structured plan.");
  }

  const parsed = planEveningResultSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Couldn't parse the plan: ${parsed.error.message}`);
  }
  return parsed.data;
}
