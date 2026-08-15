import { z } from "zod";
import { getAnthropicClient, CLAUDE_MODEL } from "./anthropic";

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const quickAddResultSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("reminder"),
    title: z.string().min(1),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    repeatDays: z.array(z.enum(WEEKDAYS)).default([]),
  }),
  z.object({
    type: z.literal("habit"),
    title: z.string().min(1),
    frequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
  }),
  z.object({
    type: z.literal("goal"),
    title: z.string().min(1),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
  }),
]);

export type QuickAddResult = z.infer<typeof quickAddResultSchema>;

const CREATE_ITEM_TOOL = {
  name: "create_item",
  description: "Create a reminder, habit, or goal based on the user's natural language request.",
  input_schema: {
    type: "object" as const,
    properties: {
      type: { type: "string", enum: ["reminder", "habit", "goal"] },
      title: { type: "string", description: "Short title for the item" },
      time: { type: "string", description: "24-hour HH:mm time. Required when type is 'reminder'." },
      repeatDays: {
        type: "array",
        items: { type: "string", enum: WEEKDAYS },
        description:
          "Weekdays this repeats on, only when type is 'reminder'. Leave empty for a one-time reminder.",
      },
      frequency: {
        type: "string",
        enum: ["daily", "weekly", "custom"],
        description: "Only when type is 'habit'. Defaults to 'daily' if unclear.",
      },
      targetDate: {
        type: "string",
        description: "YYYY-MM-DD, optional, only when type is 'goal'.",
      },
    },
    required: ["type", "title"],
  },
};

export async function parseQuickAdd(text: string): Promise<QuickAddResult> {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    throw new Error("ANTHROPIC_API_KEY is not configured on this server.");
  }

  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const context = `Today is ${now.toISOString().slice(0, 10)} (${dayName}), current time ${now
    .toTimeString()
    .slice(0, 5)}.`;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 300,
    system: `You turn a short natural-language request into a single reminder, habit, or goal.
${context} Resolve relative times/days (e.g. "tomorrow", "at 6") against this. Always call the
create_item tool exactly once.`,
    messages: [{ role: "user", content: text }],
    tools: [CREATE_ITEM_TOOL],
    tool_choice: { type: "tool", name: "create_item" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude didn't return a structured item.");
  }

  const parsed = quickAddResultSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Couldn't understand that request: ${parsed.error.message}`);
  }
  return parsed.data;
}
