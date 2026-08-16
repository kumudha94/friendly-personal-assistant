import { useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useJournalEntries } from "../hooks/useJournal";
import { useMoodLogs } from "../hooks/useMood";
import { useWaterLogs } from "../hooks/useWater";
import { useHabitLogs } from "../hooks/useHabitLogs";
import JournalComposer from "../components/JournalComposer";
import JournalEntryCard from "../components/JournalEntryCard";
import InsightCard from "../components/InsightCard";
import EmptyState from "../components/EmptyState";
import { pearsonCorrelation } from "../utils/correlation";
import type { JournalEntry } from "../types";
import { colors, MILO_BAR_CLEARANCE, radius, spacing } from "../theme/tokens";

type Tab = "write" | "insights";

export default function JournalScreen() {
  const [tab, setTab] = useState<Tab>("write");
  const entriesQuery = useJournalEntries();
  const moodQuery = useMoodLogs();
  const waterQuery = useWaterLogs();
  const habitLogsQuery = useHabitLogs();

  const isLoading =
    entriesQuery.isLoading || moodQuery.isLoading || waterQuery.isLoading || habitLogsQuery.isLoading;
  const isError = entriesQuery.isError || moodQuery.isError || waterQuery.isError || habitLogsQuery.isError;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load Journal data.</Text>
      </View>
    );
  }

  const entries = (entriesQuery.data ?? []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const moodLogs = moodQuery.data ?? [];
  const waterLogs = waterQuery.data ?? [];
  const habitLogs = habitLogsQuery.data ?? [];

  const waterMoodPairs: [number, number][] = [];
  const sleepEnergyPairs: [number, number][] = [];
  const habitMoodPairs: [number, number][] = [];

  for (const mood of moodLogs) {
    const water = waterLogs.find((w) => w.date === mood.date);
    if (water) waterMoodPairs.push([water.count, mood.moodScale]);

    sleepEnergyPairs.push([mood.sleepHours, mood.energyLevel]);

    const completions = habitLogs.filter((l) => l.date === mood.date && l.completed).length;
    habitMoodPairs.push([completions, mood.moodScale]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, tab === "write" && styles.tabButtonActive]}
          onPress={() => setTab("write")}
        >
          <Text style={[styles.tabText, tab === "write" && styles.tabTextActive]}>Write</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === "insights" && styles.tabButtonActive]}
          onPress={() => setTab("insights")}
        >
          <Text style={[styles.tabText, tab === "insights" && styles.tabTextActive]}>Insights</Text>
        </TouchableOpacity>
      </View>

      {tab === "write" ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={entries}
          keyExtractor={(item: JournalEntry) => String(item.id)}
          ListHeaderComponent={<JournalComposer />}
          ListEmptyComponent={<EmptyState title="No entries yet." subtitle="Write your first one above." />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => <JournalEntryCard entry={item} />}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          <InsightCard
            title="Water intake ↔ Mood"
            r={pearsonCorrelation(waterMoodPairs)}
            n={waterMoodPairs.length}
          />
          <InsightCard
            title="Sleep ↔ Energy"
            r={pearsonCorrelation(sleepEnergyPairs)}
            n={sleepEnergyPairs.length}
          />
          <InsightCard
            title="Habits completed ↔ Mood"
            r={pearsonCorrelation(habitMoodPairs)}
            n={habitMoodPairs.length}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  tabRow: { flexDirection: "row", padding: spacing.md, paddingBottom: 0, gap: spacing.sm },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.control,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  tabButtonActive: { backgroundColor: colors.accent },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  tabTextActive: { color: colors.textPrimary },
  list: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: 12 },
  separator: { height: 12 },
});
