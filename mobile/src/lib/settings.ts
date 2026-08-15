import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";

const STORAGE_KEY = "milo:quiet-hours";

export type QuietHours = {
  enabled: boolean;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
};

const DEFAULT_QUIET_HOURS: QuietHours = { enabled: false, start: "22:00", end: "07:00" };

export async function getQuietHours(): Promise<QuietHours> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? { ...DEFAULT_QUIET_HOURS, ...JSON.parse(raw) } : DEFAULT_QUIET_HOURS;
}

export async function setQuietHours(value: QuietHours): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function isWithinQuietHours(quietHours: QuietHours, date: Date = new Date()): boolean {
  if (!quietHours.enabled) return false;
  const current = format(date, "HH:mm");
  if (quietHours.start <= quietHours.end) {
    return current >= quietHours.start && current < quietHours.end;
  }
  // overnight window, e.g. 22:00 -> 07:00
  return current >= quietHours.start || current < quietHours.end;
}

const PROFILE_KEY = "milo:profile";

export type Profile = { name: string };

const DEFAULT_PROFILE: Profile = { name: "" };

export async function getProfile(): Promise<Profile> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
}

export async function setProfile(value: Profile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(value));
}
