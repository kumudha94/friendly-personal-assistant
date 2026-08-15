import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { WeekDay } from "../types";
import { colors } from "../theme/tokens";

const DAYS: { key: WeekDay; label: string }[] = [
  { key: "sun", label: "S" },
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
];

export default function DayPicker({
  value,
  onChange,
}: {
  value: WeekDay[];
  onChange: (value: WeekDay[]) => void;
}) {
  const toggle = (day: WeekDay) => {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]);
  };

  return (
    <View style={styles.row}>
      {DAYS.map(({ key, label }) => {
        const selected = value.includes(key);
        return (
          <TouchableOpacity
            key={key}
            onPress={() => toggle(key)}
            style={[styles.circle, selected && styles.circleSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  circleSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  textSelected: { color: colors.textPrimary },
});
