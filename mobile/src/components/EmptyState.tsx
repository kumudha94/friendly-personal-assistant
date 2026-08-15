import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme/tokens";
import MiloCore from "./milo/MiloCore";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MiloCore state="idle" size={36} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xl, alignItems: "center", gap: spacing.sm },
  title: { color: colors.textPrimary, fontSize: typography.sectionTitle.fontSize, fontWeight: "600", textAlign: "center" },
  subtitle: { color: colors.textSecondary, fontSize: typography.secondary.fontSize, textAlign: "center", paddingHorizontal: spacing.lg },
  action: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.control,
    backgroundColor: colors.accent,
  },
  actionText: { color: colors.textPrimary, fontWeight: "600", fontSize: typography.secondary.fontSize },
});
