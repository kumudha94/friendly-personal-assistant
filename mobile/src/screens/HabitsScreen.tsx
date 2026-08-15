import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useHabits } from "../hooks/useHabits";
import { useHabitLogs } from "../hooks/useHabitLogs";
import HabitForm from "../components/HabitForm";
import HabitCard from "../components/HabitCard";
import type { Habit } from "../types";

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
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No habits yet — add one above to get started.</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <HabitCard habit={item} logs={logs.filter((l) => l.habitId === item.id)} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#dc2626", textAlign: "center", padding: 24 },
  emptyState: { paddingVertical: 32, alignItems: "center" },
  emptyText: { color: "#999" },
  separator: { height: 12 },
});
