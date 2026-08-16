import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WaterProgressBar from "./WaterProgressBar";
import { DEFAULT_WATER_SETTINGS, formatWaterAmount, type WaterSettings } from "../lib/waterSettings";
import { colors, radius, spacing, typography } from "../theme/tokens";

export default function DashboardWaterRow({
  count,
  target,
  onAdd,
  settings = DEFAULT_WATER_SETTINGS,
}: {
  count: number;
  target: number;
  onAdd: () => void;
  settings?: WaterSettings;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>
          Water: {formatWaterAmount(count, settings)} of {formatWaterAmount(target, settings)}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
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
