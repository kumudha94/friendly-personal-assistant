import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useGoals } from "../hooks/useGoals";
import GoalForm from "../components/GoalForm";
import GoalCard from "../components/GoalCard";
import type { Goal } from "../types";

export default function GoalsScreen() {
  const goalsQuery = useGoals();

  if (goalsQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (goalsQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Couldn't load goals: {(goalsQuery.error as Error).message}
        </Text>
      </View>
    );
  }

  const goals = (goalsQuery.data ?? []).slice().sort((a, b) => Number(a.completed) - Number(b.completed));

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={goals}
      keyExtractor={(item: Goal) => String(item.id)}
      ListHeaderComponent={<GoalForm />}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No goals yet — add one above.</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => <GoalCard goal={item} />}
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
