import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/tokens";

interface MiloInsightProps {
  icon: string;
  text: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onNotNow: () => void;
  onMuteForever: () => void;
}

export default function MiloInsight({
  icon,
  text,
  primaryActionLabel,
  onPrimaryAction,
  onNotNow,
  onMuteForever,
}: MiloInsightProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
      <View style={styles.actionsRow}>
        {primaryActionLabel && onPrimaryAction && (
          <TouchableOpacity style={styles.primaryAction} onPress={onPrimaryAction}>
            <Text style={styles.primaryActionText}>{primaryActionLabel}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.secondaryAction} onPress={onNotNow}>
          <Text style={styles.secondaryActionText}>Not now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryAction} onPress={onMuteForever}>
          <Text style={styles.secondaryActionText}>Don't suggest again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sm + 6,
    borderRadius: radius.card,
    backgroundColor: colors.elevatedSurface,
    gap: spacing.sm,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  icon: { fontSize: 16 },
  text: { flex: 1, color: colors.textSecondary, fontSize: typography.secondary.fontSize },
  actionsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  primaryAction: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: radius.control,
    backgroundColor: colors.accent,
  },
  primaryActionText: { color: colors.textPrimary, fontSize: typography.caption.fontSize, fontWeight: "600" },
  secondaryAction: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryActionText: { color: colors.textMuted, fontSize: typography.caption.fontSize, fontWeight: "500" },
});
