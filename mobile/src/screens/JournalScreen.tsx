import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useJournalEntries } from "../hooks/useJournal";
import JournalComposer from "../components/JournalComposer";
import JournalEntryCard from "../components/JournalEntryCard";
import type { JournalEntry } from "../types";

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
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No entries yet — write your first one above.</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => <JournalEntryCard entry={item} />}
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
