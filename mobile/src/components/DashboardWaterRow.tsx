import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WaterProgressBar from "./WaterProgressBar";

export default function DashboardWaterRow({
  count,
  target,
  onAddGlass,
}: {
  count: number;
  target: number;
  onAddGlass: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>
          Water: {count}/{target} glasses
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddGlass}>
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      <WaterProgressBar count={count} target={target} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f0f9ff",
    gap: 8,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 13, fontWeight: "600", color: "#0369a1" },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
  },
});
