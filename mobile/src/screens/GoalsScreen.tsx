import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useGoals } from "../hooks/useGoals";
import GoalForm from "../components/GoalForm";
import GoalCard from "../components/GoalCard";
import EmptyState from "../components/EmptyState";
import type { Goal } from "../types";
import { colors, MILO_BAR_CLEARANCE, spacing } from "../theme/tokens";

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
        <EmptyState title="No goals yet." subtitle="Add one above." />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => <GoalCard goal={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: 12 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  separator: { height: 12 },
});
