import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";

export default function ScaleTapPicker({
  label,
  value,
  onChange,
  max = 5,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const selected = n === value;
          return (
            <TouchableOpacity
              key={n}
              style={[styles.circle, selected && styles.circleSelected]}
              onPress={() => onChange(n)}
            >
              <Text style={[styles.text, selected && styles.textSelected]}>{n}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  row: { flexDirection: "row", gap: spacing.sm },
  circle: {
    flex: 1,
    height: 36,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  circleSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  textSelected: { color: colors.textPrimary },
});
