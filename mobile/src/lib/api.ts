import type {
  CycleLog,
  DigestResult,
  EveningPlan,
  FinanceSnapshot,
  Goal,
  Habit,
  HabitLog,
  JournalEntry,
  JournalType,
  KitchenSnapshot,
  Medication,
  MedicationLog,
  Memory,
  MoodLog,
  QuickAddResult,
  Reminder,
  SymptomLog,
  WaterLog,
  WeatherSnapshot,
  WeekDay,
  WeightLog,
  WeightUnit,
} from "../types";

import { getToken, clearToken } from "./authStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";

let onUnauthorized: (() => void) | null = null;

// Registered once by App.tsx, so a 401 anywhere (expired/invalid session) can kick the
// user back to the login screen without every call site needing to handle it.
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 401 || res.status === 403) {
    await clearToken();
    onUnauthorized?.();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed with ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Milo's own login — independent account, own OTP flow (not shared with FinanceTracker or
// KitchenPlanner). Unauthenticated on purpose: request()'s Bearer header doesn't apply here.
export async function requestOtp(email: string, name: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Couldn't send the code.");
  }
}

export type AuthUser = { id: number; name: string; email: string };

export async function verifyOtp(email: string, code: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message ?? "That code didn't work.");
  }
  return body;
}

// Connected Apps — read-only, explicit-consent access to FinanceTracker/KitchenPlanner data.
export type ConnectionEntry = {
  appId: "financetracker" | "kitchenplanner";
  name: string;
  status: "not_installed" | "connectable" | "connected";
  email?: string;
};

export function getConnections() {
  return request<ConnectionEntry[]>("/connections");
}

export function requestConnectOtp(appId: string) {
  return request<void>(`/connections/${appId}/request-otp`, { method: "POST" });
}

export function verifyConnectOtp(appId: string, code: string) {
  return request<void>(`/connections/${appId}/verify-otp`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function disconnectApp(appId: string) {
  return request<void>(`/connections/${appId}`, { method: "DELETE" });
}

export function deleteAccount() {
  return request<void>("/account", { method: "DELETE" });
}

export function getHabits() {
  return request<Habit[]>("/habits");
}

export function createHabit(input: { name: string; frequency: string; targetCount: number }) {
  return request<Habit>("/habits", { method: "POST", body: JSON.stringify(input) });
}

export function updateHabit(id: number, patch: Partial<Pick<Habit, "name" | "frequency" | "targetCount">>) {
  return request<Habit>(`/habits/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
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

export type CreateMedicationInput = Omit<Medication, "id" | "createdAt">;

export function createMedication(input: CreateMedicationInput) {
  return request<Medication>("/medications", { method: "POST", body: JSON.stringify(input) });
}

export function updateMedication(id: number, patch: Partial<CreateMedicationInput>) {
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

export function getFinanceSnapshot() {
  return request<FinanceSnapshot>("/finance_snapshot");
}

export function getKitchenSnapshot(date: string) {
  return request<KitchenSnapshot>(`/kitchen_snapshot?date=${date}`);
}

export function getWeather(location: string) {
  return request<WeatherSnapshot>(`/weather?location=${encodeURIComponent(location)}`);
}
