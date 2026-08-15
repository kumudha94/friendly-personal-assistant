import type { Goal, Habit, HabitLog, JournalEntry, JournalType, MoodLog, Reminder, WaterLog, WeekDay } from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed with ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getHabits() {
  return request<Habit[]>("/habits");
}

export function createHabit(input: { name: string; frequency: string; targetCount: number }) {
  return request<Habit>("/habits", { method: "POST", body: JSON.stringify(input) });
}

export function deleteHabit(id: number) {
  return request<void>(`/habits/${id}`, { method: "DELETE" });
}

export function getHabitLogs() {
  return request<HabitLog[]>("/habit_logs");
}

export function setHabitLog(input: { habitId: number; date: string; completed: boolean }) {
  return request<HabitLog>("/habit_logs", { method: "POST", body: JSON.stringify(input) });
}

export function getReminders() {
  return request<Reminder[]>("/reminders");
}

export function createReminder(input: { title: string; time: string; repeatDays: WeekDay[] }) {
  return request<Reminder>("/reminders", {
    method: "POST",
    body: JSON.stringify({ ...input, active: true }),
  });
}

export function updateReminder(id: number, patch: Partial<Pick<Reminder, "title" | "time" | "repeatDays" | "active">>) {
  return request<Reminder>(`/reminders/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteReminder(id: number) {
  return request<void>(`/reminders/${id}`, { method: "DELETE" });
}

export function getWaterLogs() {
  return request<WaterLog[]>("/water_logs");
}

export function setWaterLog(input: { date: string; count: number; target: number }) {
  return request<WaterLog>("/water_logs", { method: "POST", body: JSON.stringify(input) });
}

export function getGoals() {
  return request<Goal[]>("/goals");
}

export function createGoal(input: {
  title: string;
  description?: string;
  habitId?: number | null;
  targetDate?: string | null;
}) {
  return request<Goal>("/goals", { method: "POST", body: JSON.stringify(input) });
}

export function updateGoal(id: number, patch: Partial<Pick<Goal, "title" | "description" | "habitId" | "targetDate" | "completed">>) {
  return request<Goal>(`/goals/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteGoal(id: number) {
  return request<void>(`/goals/${id}`, { method: "DELETE" });
}

export function getJournalEntries() {
  return request<JournalEntry[]>("/journal_entries");
}

export function createJournalEntry(input: { type: JournalType; date: string; content: string }) {
  return request<JournalEntry>("/journal_entries", { method: "POST", body: JSON.stringify(input) });
}

export function deleteJournalEntry(id: number) {
  return request<void>(`/journal_entries/${id}`, { method: "DELETE" });
}

export function getMoodLogs() {
  return request<MoodLog[]>("/mood_logs");
}

export function setMoodLog(input: {
  date: string;
  moodScale: number;
  energyLevel: number;
  sleepHours: number;
  notes?: string | null;
}) {
  return request<MoodLog>("/mood_logs", { method: "POST", body: JSON.stringify(input) });
}
