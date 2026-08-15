import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { WeightUnit } from "../types";

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
  row: { flexDirection: "row", gap: 8 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  pillSelected: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  pillText: { color: "#333", fontSize: 13, fontWeight: "500" },
  pillTextSelected: { color: "#fff" },
});
