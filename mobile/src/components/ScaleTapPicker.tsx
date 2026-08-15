import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  label: { fontSize: 13, fontWeight: "600", color: "#333" },
  row: { flexDirection: "row", gap: 8 },
  circle: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  circleSelected: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  text: { fontSize: 14, fontWeight: "600", color: "#333" },
  textSelected: { color: "#fff" },
});
