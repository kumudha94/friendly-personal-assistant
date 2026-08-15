import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";
import { cancelReminderNotifications, scheduleReminderNotifications } from "../lib/notifications";
import type { Reminder } from "../types";

export function useReminders() {
  return useQuery({ queryKey: ["reminders"], queryFn: api.getReminders });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createReminder,
    onSuccess: async (reminder: Reminder) => {
      await scheduleReminderNotifications(reminder);
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<Reminder> }) =>
      api.updateReminder(id, patch),
    onSuccess: async (reminder: Reminder) => {
      await scheduleReminderNotifications(reminder);
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.deleteReminder(id);
      await cancelReminderNotifications(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });
}
