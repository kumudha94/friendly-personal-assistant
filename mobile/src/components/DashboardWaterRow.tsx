import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WaterProgressBar from "./WaterProgressBar";
import { colors, radius, spacing, typography } from "../theme/tokens";

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
          <Ionicons name="add" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <WaterProgressBar count={count} target={target} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sm + 6,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: typography.secondary.fontSize, fontWeight: "600", color: colors.water },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.water,
    alignItems: "center",
    justifyContent: "center",
  },
});
