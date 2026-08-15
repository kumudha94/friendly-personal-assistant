import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import type { JournalEntry } from "../types";
import { JOURNAL_TYPE_LABELS } from "../utils/journalPrompts";
import { useDeleteJournalEntry } from "../hooks/useJournal";

export default function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const deleteEntry = useDeleteJournalEntry();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{JOURNAL_TYPE_LABELS[entry.type]}</Text>
        </View>
        <Text style={styles.date}>{format(parseISO(entry.date), "MMM d, yyyy")}</Text>
        <TouchableOpacity onPress={() => deleteEntry.mutate(entry.id)}>
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
      <Text style={styles.content}>{entry.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    gap: 8,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#4f46e5" },
  date: { flex: 1, fontSize: 12, color: "#999" },
  content: { fontSize: 14, color: "#111", lineHeight: 20 },
});
