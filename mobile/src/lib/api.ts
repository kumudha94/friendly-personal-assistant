import type {
  CycleLog,
  DigestResult,
  EveningPlan,
  Goal,
  Habit,
  HabitLog,
  JournalEntry,
  JournalType,
  Medication,
  MedicationLog,
  Memory,
  MoodLog,
  QuickAddResult,
  Reminder,
  SymptomLog,
  WaterLog,
  WeekDay,
  WeightLog,
  WeightUnit,
} from "../types";

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

export function getDigest(period: "daily" | "weekly") {
  return request<DigestResult>(`/digest?period=${period}`);
}

export function planEvening() {
  return request<EveningPlan>("/plan_evening", { method: "POST" });
}

export function quickAdd(text: string) {
  return request<QuickAddResult>("/quick_add", { method: "POST", body: JSON.stringify({ text }) });
}

export function getWeightLogs() {
  return request<WeightLog[]>("/weight_logs");
}

export function setWeightLog(input: { date: string; weight: number; unit: WeightUnit; notes?: string | null }) {
  return request<WeightLog>("/weight_logs", { method: "POST", body: JSON.stringify(input) });
}

export function getMedications() {
  return request<Medication[]>("/medications");
}

export function createMedication(input: { name: string; dosage: string; quantityRemaining: number; refillThreshold: number }) {
  return request<Medication>("/medications", { method: "POST", body: JSON.stringify(input) });
}

export function updateMedication(id: number, patch: Partial<Pick<Medication, "name" | "dosage" | "quantityRemaining" | "refillThreshold" | "active">>) {
  return request<Medication>(`/medications/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteMedication(id: number) {
  return request<void>(`/medications/${id}`, { method: "DELETE" });
}

export function getMedicationLogs() {
  return request<MedicationLog[]>("/medication_logs");
}

export function setMedicationLog(input: { medicationId: number; date: string; taken: boolean }) {
  return request<{ log: MedicationLog; medication: Medication }>("/medication_logs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getSymptomLogs() {
  return request<SymptomLog[]>("/symptom_logs");
}

export function createSymptomLog(input: { date: string; symptom: string; severity: number; notes?: string | null }) {
  return request<SymptomLog>("/symptom_logs", { method: "POST", body: JSON.stringify(input) });
}

export function deleteSymptomLog(id: number) {
  return request<void>(`/symptom_logs/${id}`, { method: "DELETE" });
}

export function getCycleLogs() {
  return request<CycleLog[]>("/cycle_logs");
}

export function createCycleLog(input: { startDate: string; endDate?: string | null; notes?: string | null }) {
  return request<CycleLog>("/cycle_logs", { method: "POST", body: JSON.stringify(input) });
}

export function updateCycleLog(id: number, patch: Partial<Pick<CycleLog, "startDate" | "endDate" | "notes">>) {
  return request<CycleLog>(`/cycle_logs/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteCycleLog(id: number) {
  return request<void>(`/cycle_logs/${id}`, { method: "DELETE" });
}

export function getMemories() {
  return request<Memory[]>("/memories");
}

export function createMemory(input: { text: string }) {
  return request<Memory>("/memories", { method: "POST", body: JSON.stringify(input) });
}

export function updateMemory(id: number, patch: { text: string }) {
  return request<Memory>(`/memories/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteMemory(id: number) {
  return request<void>(`/memories/${id}`, { method: "DELETE" });
}
