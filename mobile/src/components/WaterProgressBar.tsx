import { StyleSheet, View } from "react-native";

export default function WaterProgressBar({ count, target }: { count: number; target: number }) {
  const pct = target > 0 ? Math.min(count / target, 1) : 0;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 14,
    borderRadius: 7,
    backgroundColor: "#e5e5e5",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#0ea5e9",
    borderRadius: 7,
  },
});
