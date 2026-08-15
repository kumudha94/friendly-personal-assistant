import { StyleSheet, Text, View } from "react-native";
import { format, parseISO } from "date-fns";
import { lastNDays } from "../utils/date";
import { colors } from "../theme/tokens";

export default function WeekGrid({ completedDates }: { completedDates: Set<string> }) {
  const days = lastNDays(7);
  return (
    <View style={styles.row}>
      {days.map((day) => (
        <View key={day} style={styles.dayColumn}>
          <Text style={styles.dayLabel}>{format(parseISO(day), "EEEEE")}</Text>
          <View style={[styles.dot, completedDates.has(day) && styles.dotFilled]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  dayColumn: { alignItems: "center", gap: 4 },
  dayLabel: { fontSize: 10, color: colors.textMuted },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.border },
  dotFilled: { backgroundColor: colors.accent, borderColor: colors.accent },
});
