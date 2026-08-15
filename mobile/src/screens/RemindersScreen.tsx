import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useReminders } from "../hooks/useReminders";
import { ensureAndroidChannel, requestNotificationPermissions } from "../lib/notifications";
import ReminderForm from "../components/ReminderForm";
import ReminderCard from "../components/ReminderCard";
import type { Reminder } from "../types";

export default function RemindersScreen() {
  const remindersQuery = useReminders();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      await ensureAndroidChannel();
      setPermissionGranted(await requestNotificationPermissions());
    })();
  }, []);

  if (remindersQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (remindersQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Couldn't load reminders: {(remindersQuery.error as Error).message}
        </Text>
      </View>
    );
  }

  const reminders = remindersQuery.data ?? [];

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={reminders}
      keyExtractor={(item: Reminder) => String(item.id)}
      ListHeaderComponent={
        <View style={styles.headerGap}>
          {permissionGranted === false && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                Notifications are disabled — reminders won't fire until you allow them in system
                settings.
              </Text>
            </View>
          )}
          <ReminderForm />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No reminders yet — add one above.</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => <ReminderCard reminder={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  headerGap: { gap: 12 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#dc2626", textAlign: "center", padding: 24 },
  emptyState: { paddingVertical: 32, alignItems: "center" },
  emptyText: { color: "#999" },
  separator: { height: 12 },
  warningBanner: { backgroundColor: "#fef3c7", borderRadius: 8, padding: 10 },
  warningText: { color: "#92400e", fontSize: 12 },
});
