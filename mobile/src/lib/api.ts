import type { Habit, HabitLog } from "../types";

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
