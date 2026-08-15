import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Frequency } from "../types";

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
  row: { flexDirection: "row", gap: 8 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  pillSelected: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  pillText: { color: "#333", fontSize: 13, fontWeight: "500" },
  pillTextSelected: { color: "#fff" },
});
