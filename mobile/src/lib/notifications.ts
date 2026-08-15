import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Reminder, WeekDay } from "../types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// expo-notifications weekday convention: 1 = Sunday ... 7 = Saturday.
const WEEKDAY_INDEX: Record<WeekDay, number> = {
  sun: 1,
  mon: 2,
  tue: 3,
  wed: 4,
  thu: 5,
  fri: 6,
  sat: 7,
};

const storageKey = (reminderId: number) => `milo:reminder-notifications:${reminderId}`;

export async function requestNotificationPermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === "granted") return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === "granted";
}

export async function ensureAndroidChannel() {
  await Notifications.setNotificationChannelAsync("reminders", {
    name: "Reminders",
    importance: Notifications.AndroidImportance.HIGH,
  });
}

async function getStoredIds(reminderId: number): Promise<string[]> {
  const raw = await AsyncStorage.getItem(storageKey(reminderId));
  return raw ? JSON.parse(raw) : [];
}

async function setStoredIds(reminderId: number, ids: string[]) {
  await AsyncStorage.setItem(storageKey(reminderId), JSON.stringify(ids));
}

export async function cancelReminderNotifications(reminderId: number) {
  const ids = await getStoredIds(reminderId);
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  await AsyncStorage.removeItem(storageKey(reminderId));
}

function nextOneOffDate(hour: number, minute: number): Date {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (date.getTime() <= now.getTime()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

/**
 * (Re)schedules OS-level triggers for a reminder. Weekly triggers repeat natively on the
 * device, so there's no app-side "reschedule after firing" step to maintain.
 */
export async function scheduleReminderNotifications(reminder: Reminder) {
  await cancelReminderNotifications(reminder.id);
  if (!reminder.active) return;

  const [hour, minute] = reminder.time.split(":").map(Number);
  const ids: string[] = [];

  if (reminder.repeatDays.length === 0) {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: "Milo reminder", body: reminder.title },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: nextOneOffDate(hour, minute),
      },
    });
    ids.push(id);
  } else {
    for (const day of reminder.repeatDays) {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: "Milo reminder", body: reminder.title },
        trigger: {
          type: SchedulableTriggerInputTypes.WEEKLY,
          weekday: WEEKDAY_INDEX[day],
          hour,
          minute,
        },
      });
      ids.push(id);
    }
  }

  await setStoredIds(reminder.id, ids);
}

export async function snoozeReminder(reminder: Reminder, minutes: number) {
  await Notifications.scheduleNotificationAsync({
    content: { title: "Milo reminder (snoozed)", body: reminder.title },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: minutes * 60,
      repeats: false,
    },
  });
}
