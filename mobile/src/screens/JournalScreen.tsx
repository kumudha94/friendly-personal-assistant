import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useJournalEntries } from "../hooks/useJournal";
import JournalComposer from "../components/JournalComposer";
import JournalEntryCard from "../components/JournalEntryCard";
import EmptyState from "../components/EmptyState";
import type { JournalEntry } from "../types";
import { colors, MILO_BAR_CLEARANCE, spacing } from "../theme/tokens";

export default function JournalScreen() {
  const entriesQuery = useJournalEntries();

  if (entriesQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (entriesQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Couldn't load journal entries: {(entriesQuery.error as Error).message}
        </Text>
      </View>
    );
  }

  const entries = (entriesQuery.data ?? [])
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={entries}
      keyExtractor={(item: JournalEntry) => String(item.id)}
      ListHeaderComponent={<JournalComposer />}
      ListEmptyComponent={
        <EmptyState title="No entries yet." subtitle="Write your first one above." />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => <JournalEntryCard entry={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: 12 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  separator: { height: 12 },
});
