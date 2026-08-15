import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import type { SymptomLog } from "../types";
import { useDeleteSymptomLog } from "../hooks/useMedications";
import { colors, radius } from "../theme/tokens";

export default function SymptomLogCard({ log }: { log: SymptomLog }) {
  const deleteSymptomLog = useDeleteSymptomLog();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.symptom}>{log.symptom}</Text>
          <Text style={styles.meta}>
            {format(parseISO(log.date), "MMM d")} · severity {log.severity}/5
          </Text>
        </View>
        <TouchableOpacity onPress={() => deleteSymptomLog.mutate(log.id)}>
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
      {!!log.notes && <Text style={styles.notes}>{log.notes}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  titleGroup: { flex: 1 },
  symptom: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  notes: { fontSize: 13, color: colors.textSecondary },
});
