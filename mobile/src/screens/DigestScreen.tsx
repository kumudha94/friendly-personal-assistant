import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGenerateDigest } from "../hooks/useDigest";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";

type Period = "daily" | "weekly";

export default function DigestScreen() {
  const [period, setPeriod] = useState<Period>("daily");
  const generateDigest = useGenerateDigest();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Milo digest</Text>
      <Text style={styles.subheading}>
        A Claude-generated summary of your recent habits, reminders, water, mood, and goals.
      </Text>

      <View style={styles.pillRow}>
        {(["daily", "weekly"] as Period[]).map((p) => {
          const selected = p === period;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                {p === "daily" ? "Daily" : "Weekly"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => generateDigest.mutate(period)}
        disabled={generateDigest.isPending}
      >
        {generateDigest.isPending ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Generate digest</Text>
        )}
      </TouchableOpacity>

      {generateDigest.isError && (
        <Text style={styles.error}>{(generateDigest.error as Error).message}</Text>
      )}

      {generateDigest.data && (
        <View style={styles.resultBlock}>
          <Text style={styles.headlineText}>{generateDigest.data.headline}</Text>

          {generateDigest.data.highlight && (
            <View style={styles.highlightCard}>
              <Text style={styles.highlightIcon}>💡</Text>
              <Text style={styles.highlightText}>{generateDigest.data.highlight}</Text>
            </View>
          )}

          {generateDigest.data.sections.map((section) => (
            <View key={section.label} style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>{section.label}</Text>
              <Text style={styles.sectionDetail}>{section.detail}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: 14 },
  heading: { fontSize: typography.sectionTitle.fontSize, fontWeight: "700", color: colors.textPrimary },
  subheading: { fontSize: 13, color: colors.textMuted },
  pillRow: { flexDirection: "row", gap: spacing.sm },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.control,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  pillSelected: { backgroundColor: colors.accent },
  pillText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  pillTextSelected: { color: colors.textPrimary },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.control,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  error: { color: colors.error, fontSize: 12 },
  resultBlock: { gap: spacing.sm },
  headlineText: {
    fontSize: typography.sectionTitle.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 26,
  },
  highlightCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.sm + 6,
    borderRadius: radius.card,
    backgroundColor: colors.elevatedSurface,
  },
  highlightIcon: { fontSize: 16 },
  highlightText: { flex: 1, fontSize: typography.secondary.fontSize, color: colors.textSecondary, lineHeight: 19 },
  sectionCard: {
    padding: spacing.sm + 6,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  sectionLabel: { fontSize: typography.caption.fontSize, fontWeight: "600", color: colors.accent },
  sectionDetail: { fontSize: typography.secondary.fontSize, color: colors.textPrimary, lineHeight: 19 },
});
