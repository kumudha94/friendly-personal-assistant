import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

let client: Anthropic | null = null;

// Lazy + non-throwing at import time: the rest of the backend (habits, reminders,
// water, goals, journal, mood) must keep working even before ANTHROPIC_API_KEY is
// configured in a given environment (e.g. Render, until the env var is added there).
export function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}
