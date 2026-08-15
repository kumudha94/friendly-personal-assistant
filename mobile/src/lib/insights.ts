import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "milo:insight-dismissals";

// value per insight id: "forever" (muted permanently) or a "YYYY-MM-DD" date
// (dismissed only for that day)
export type Dismissals = Record<string, string>;

export async function getDismissals(): Promise<Dismissals> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function setDismissals(dismissals: Dismissals): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dismissals));
}

export async function dismissToday(id: string, today: string): Promise<Dismissals> {
  const dismissals = await getDismissals();
  const next = { ...dismissals, [id]: today };
  await setDismissals(next);
  return next;
}

export async function muteForever(id: string): Promise<Dismissals> {
  const dismissals = await getDismissals();
  const next = { ...dismissals, [id]: "forever" };
  await setDismissals(next);
  return next;
}

export function isDismissed(dismissals: Dismissals, id: string, today: string): boolean {
  const value = dismissals[id];
  if (!value) return false;
  return value === "forever" || value === today;
}
