import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useHabits } from "../hooks/useHabits";
import { useHabitLogs } from "../hooks/useHabitLogs";
import HabitForm from "../components/HabitForm";
import HabitCard from "../components/HabitCard";
import EmptyState from "../components/EmptyState";
import type { Habit } from "../types";
import { colors, MILO_BAR_CLEARANCE, spacing } from "../theme/tokens";

export default function HabitsScreen() {
  const habitsQuery = useHabits();
  const logsQuery = useHabitLogs();

  if (habitsQuery.isLoading || logsQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (habitsQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load habits: {(habitsQuery.error as Error).message}</Text>
      </View>
    );
  }

  const habits = habitsQuery.data ?? [];
  const logs = logsQuery.data ?? [];

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={habits}
      keyExtractor={(item: Habit) => String(item.id)}
      ListHeaderComponent={<HabitForm />}
      ListEmptyComponent={
        <EmptyState title="No habits yet." subtitle="Add one above to get started." />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <HabitCard habit={item} logs={logs.filter((l) => l.habitId === item.id)} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: 12 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  separator: { height: 12 },
});
