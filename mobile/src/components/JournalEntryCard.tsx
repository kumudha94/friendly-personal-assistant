import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import type { JournalEntry } from "../types";
import { JOURNAL_TYPE_LABELS } from "../utils/journalPrompts";
import { useDeleteJournalEntry } from "../hooks/useJournal";
import { colors, radius, spacing } from "../theme/tokens";

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
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
      <Text style={styles.content}>{entry.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  badge: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: colors.accent },
  date: { flex: 1, fontSize: 12, color: colors.textMuted },
  content: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
});
