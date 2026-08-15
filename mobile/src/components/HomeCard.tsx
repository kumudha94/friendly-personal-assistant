import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme/tokens";

interface HomeCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  status: string;
  onPress?: () => void;
  gradient?: boolean;
  disabled?: boolean;
}

export default function HomeCard({ icon, title, status, onPress, gradient, disabled }: HomeCardProps) {
  const content = (
    <>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.textPrimary} />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
      {!disabled && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
    </>
  );

  if (gradient) {
    return (
      <TouchableOpacity activeOpacity={disabled ? 1 : 0.85} onPress={disabled ? undefined : onPress} disabled={disabled}>
        <LinearGradient
          colors={[colors.accentSoft, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} activeOpacity={disabled ? 1 : 0.85} onPress={disabled ? undefined : onPress} disabled={disabled}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.surface,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  textGroup: { flex: 1, gap: 2 },
  title: { fontSize: typography.body.fontSize, fontWeight: "700", color: colors.textPrimary },
  status: { fontSize: typography.secondary.fontSize, color: colors.textSecondary },
});
