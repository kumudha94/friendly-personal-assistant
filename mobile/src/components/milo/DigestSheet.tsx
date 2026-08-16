import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGenerateDigest } from "../../hooks/useDigest";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import MiloCore from "./MiloCore";

interface DigestSheetProps {
  visible: boolean;
  onClose: () => void;
}

type Period = "daily" | "weekly";

export default function DigestSheet({ visible, onClose }: DigestSheetProps) {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("daily");
  const generateDigest = useGenerateDigest();

  useEffect(() => {
    if (!visible) {
      generateDigest.reset();
      setPeriod("daily");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const coreState = generateDigest.isPending ? "thinking" : generateDigest.isSuccess ? "success" : "idle";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <MiloCore state={coreState} size={40} />
          <Text style={styles.title}>Milo digest</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: colors.elevatedSurface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    padding: spacing.md,
    gap: spacing.sm,
    maxHeight: "80%",
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  header: { alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs },
  title: { color: colors.textPrimary, fontSize: typography.sectionTitle.fontSize, fontWeight: typography.sectionTitle.fontWeight },
  scrollContent: { gap: 14 },
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
    backgroundColor: colors.surface,
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
