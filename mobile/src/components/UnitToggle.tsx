import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { WeightUnit } from "../types";
import { colors, spacing } from "../theme/tokens";

export default function UnitToggle({
  value,
  onChange,
}: {
  value: WeightUnit;
  onChange: (value: WeightUnit) => void;
}) {
  return (
    <View style={styles.row}>
      {(["kg", "lbs"] as WeightUnit[]).map((unit) => {
        const selected = unit === value;
        return (
          <TouchableOpacity
            key={unit}
            style={[styles.pill, selected && styles.pillSelected]}
            onPress={() => onChange(unit)}
          >
            <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{unit}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillText: { color: colors.textSecondary, fontSize: 13, fontWeight: "500" },
  pillTextSelected: { color: colors.textPrimary },
});
