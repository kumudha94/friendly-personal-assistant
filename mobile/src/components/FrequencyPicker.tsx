import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Frequency } from "../types";
import { colors, spacing } from "../theme/tokens";

const OPTIONS: Frequency[] = ["daily", "weekly", "custom"];

export default function FrequencyPicker({
  value,
  onChange,
}: {
  value: Frequency;
  onChange: (value: Frequency) => void;
}) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option === value;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            style={[styles.pill, selected && styles.pillSelected]}
          >
            <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
              {option[0].toUpperCase() + option.slice(1)}
            </Text>
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
  },
  pillSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillText: { color: colors.textSecondary, fontSize: 13, fontWeight: "500" },
  pillTextSelected: { color: colors.textPrimary },
});
