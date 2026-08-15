import type { JournalType } from "../types";

export const JOURNAL_TYPE_LABELS: Record<JournalType, string> = {
  daily: "Daily",
  weekly: "Weekly review",
  monthly: "Monthly review",
};

export const JOURNAL_PROMPTS: Record<JournalType, string> = {
  daily: "What happened today? How are you feeling?",
  weekly: "What went well this week? What could improve? What's one focus for next week?",
  monthly: "What are you proud of this month? What patterns do you notice? What's your intention for next month?",
};
