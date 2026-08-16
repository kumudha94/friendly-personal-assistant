import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "milo:cycle-notifications";
const PREPARE_DAYS_BEFORE = 2;
const FORGOT_DAYS_AFTER = 1;
const NOTIFY_HOUR = 9;
const NOTIFY_MINUTE = 0;

async function getStoredIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function setStoredIds(ids: string[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export async function cancelCycleNotifications() {
  const ids = await getStoredIds();
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  await AsyncStorage.removeItem(STORAGE_KEY);
}

function atTime(date: Date, hour: number, minute: number): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/**
 * (Re)schedules the two cycle notifications from a predicted next start date. Call this
 * whenever a period is logged, deleted, or the cycle-length setting changes — a fresh call
 * always cancels whatever was scheduled from the previous prediction first, so logging a new
 * period start supersedes a stale "did you forget" check that would otherwise still be pending.
 */
export async function scheduleCycleNotifications(predictedStart: Date | null) {
  await cancelCycleNotifications();
  if (!predictedStart) return;

  const now = new Date();
  const ids: string[] = [];

  const prepareDate = atTime(predictedStart, NOTIFY_HOUR, NOTIFY_MINUTE);
  prepareDate.setDate(prepareDate.getDate() - PREPARE_DAYS_BEFORE);
  if (prepareDate.getTime() > now.getTime()) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Milo",
        body: `You'll get your periods in ${PREPARE_DAYS_BEFORE} days. Prepare for it.`,
      },
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: prepareDate },
    });
    ids.push(id);
  }

  const forgotDate = atTime(predictedStart, NOTIFY_HOUR, NOTIFY_MINUTE);
  forgotDate.setDate(forgotDate.getDate() + FORGOT_DAYS_AFTER);
  if (forgotDate.getTime() > now.getTime()) {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: "Milo", body: "Did you forget to log your periods? How are you?" },
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: forgotDate },
    });
    ids.push(id);
  }

  await setStoredIds(ids);
}
