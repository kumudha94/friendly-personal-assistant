import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Medication } from "../types";
import { WEEKDAY_INDEX } from "./notifications";

const storageKey = (medicationId: number) => `milo:medication-notifications:${medicationId}`;

// "Every X days" has no native repeating trigger on expo-notifications, so instead of one
// repeating trigger we pre-schedule this many one-off future occurrences per time slot. Keeps
// the exact chosen time-of-day and exact day-spacing, at the cost of needing to reopen the
// Medications screen occasionally (edits reschedule) to keep the queue topped up beyond this.
const EVERY_X_DAYS_OCCURRENCES = 12;

async function getStoredIds(medicationId: number): Promise<string[]> {
  const raw = await AsyncStorage.getItem(storageKey(medicationId));
  return raw ? JSON.parse(raw) : [];
}

async function setStoredIds(medicationId: number, ids: string[]) {
  await AsyncStorage.setItem(storageKey(medicationId), JSON.stringify(ids));
}

export async function cancelMedicationNotifications(medicationId: number) {
  const ids = await getStoredIds(medicationId);
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  await AsyncStorage.removeItem(storageKey(medicationId));
}

function futureEveryXDaysDates(startDate: string, intervalDays: number, hour: number, minute: number): Date[] {
  const [y, m, d] = startDate.split("-").map(Number);
  const now = new Date();
  const dates: Date[] = [];
  let cursor = new Date(y, m - 1, d, hour, minute, 0, 0);
  while (dates.length < EVERY_X_DAYS_OCCURRENCES) {
    if (cursor.getTime() > now.getTime()) dates.push(new Date(cursor));
    cursor = new Date(cursor.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  }
  return dates;
}

/** (Re)schedules OS-level triggers for a medication's reminder, based on its interval. */
export async function scheduleMedicationNotifications(medication: Medication) {
  await cancelMedicationNotifications(medication.id);
  if (!medication.reminderEnabled || medication.interval === "as_needed") return;

  const body = medication.message?.trim() || `Time to take ${medication.name}`;
  const startDate = medication.startDate ?? new Date().toISOString().slice(0, 10);
  const ids: string[] = [];

  for (const entry of medication.times) {
    const [hour, minute] = entry.time.split(":").map(Number);
    const content = { title: "Milo medication reminder", body };

    if (medication.interval === "daily") {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: SchedulableTriggerInputTypes.DAILY, hour, minute },
      });
      ids.push(id);
    } else if (medication.interval === "weekly") {
      for (const day of medication.repeatDays) {
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: SchedulableTriggerInputTypes.WEEKLY, weekday: WEEKDAY_INDEX[day], hour, minute },
        });
        ids.push(id);
      }
    } else if (medication.interval === "monthly") {
      for (const day of medication.daysOfMonth) {
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: SchedulableTriggerInputTypes.MONTHLY, day, hour, minute },
        });
        ids.push(id);
      }
    } else if (medication.interval === "every_x_days" && medication.intervalDays) {
      const dates = futureEveryXDaysDates(startDate, medication.intervalDays, hour, minute);
      for (const date of dates) {
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: SchedulableTriggerInputTypes.DATE, date },
        });
        ids.push(id);
      }
    }
  }

  await setStoredIds(medication.id, ids);
}
