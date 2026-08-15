import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useReminders } from "../hooks/useReminders";
import { ensureAndroidChannel, requestNotificationPermissions } from "../lib/notifications";
import ReminderForm from "../components/ReminderForm";
import ReminderCard from "../components/ReminderCard";
import EmptyState from "../components/EmptyState";
import type { Reminder } from "../types";
import { colors, MILO_BAR_CLEARANCE, radius, spacing } from "../theme/tokens";

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
        <EmptyState title="No reminders yet." subtitle="Add one above." />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => <ReminderCard reminder={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: 12 },
  headerGap: { gap: 12 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  separator: { height: 12 },
  warningBanner: { backgroundColor: colors.elevatedSurface, borderRadius: radius.control, padding: 10 },
  warningText: { color: colors.warning, fontSize: 12 },
});
