import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePlanEvening } from "../../hooks/usePlanEvening";
import { useCreateReminder } from "../../hooks/useReminders";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import MiloCore from "./MiloCore";
import AgentActivity from "./AgentActivity";

interface PlanEveningSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function PlanEveningSheet({ visible, onClose }: PlanEveningSheetProps) {
  const insets = useSafeAreaInsets();
  const planEvening = usePlanEvening();
  const createReminder = useCreateReminder();
  const [accepted, setAccepted] = useState<number | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (visible) {
      setAccepted(null);
      planEvening.mutate();
    } else {
      planEvening.reset();
      setAccepted(null);
      setAccepting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleAccept = async () => {
    if (!planEvening.data) return;
    setAccepting(true);
    let created = 0;
    for (const item of planEvening.data.items) {
      try {
        await createReminder.mutateAsync({ title: item.title, time: item.time, repeatDays: [] });
        created += 1;
      } catch {
        // keep going — one failed item shouldn't block the rest
      }
    }
    setAccepting(false);
    setAccepted(created);
  };

  const coreState = planEvening.isPending ? "thinking" : accepted !== null ? "success" : "idle";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <MiloCore state={coreState} size={40} />
          <Text style={styles.title}>Planning your evening</Text>
        </View>

        {planEvening.isPending && <AgentActivity pending />}

        {planEvening.isError && (
          <View style={styles.errorBlock}>
            <Text style={styles.error}>{(planEvening.error as Error).message}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => planEvening.mutate()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {planEvening.data && accepted === null && (
          <>
            <Text style={styles.summary}>{planEvening.data.summary}</Text>
            <View style={styles.planList}>
              {planEvening.data.items.map((item) => (
                <View key={`${item.time}-${item.title}`} style={styles.planItem}>
                  <Text style={styles.planTime}>{item.time}</Text>
                  <Text style={styles.planTitle}>{item.title}</Text>
                </View>
              ))}
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.changeButton} onPress={onClose} disabled={accepting}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} disabled={accepting}>
                {accepting ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.acceptText}>Accept</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}

        {accepted !== null && (
          <View style={styles.receiptCard}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.receiptText}>
              Evening plan created — {accepted} reminder{accepted === 1 ? "" : "s"} added
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: colors.elevatedSurface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    padding: spacing.md,
    gap: spacing.sm,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  header: { alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs },
  title: { color: colors.textPrimary, fontSize: typography.sectionTitle.fontSize, fontWeight: typography.sectionTitle.fontWeight },
  errorBlock: { gap: spacing.sm },
  error: { color: colors.error, fontSize: typography.caption.fontSize },
  retryButton: { alignSelf: "flex-start" },
  retryText: { color: colors.accent, fontWeight: "600", fontSize: typography.caption.fontSize },
  summary: { color: colors.textSecondary, fontSize: typography.secondary.fontSize, lineHeight: 19 },
  planList: { gap: spacing.xs },
  planItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm + 4,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
  },
  planTime: { color: colors.accent, fontSize: typography.secondary.fontSize, fontWeight: "700", minWidth: 48 },
  planTitle: { flex: 1, color: colors.textPrimary, fontSize: typography.secondary.fontSize },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  changeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.control,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  changeText: { color: colors.textSecondary, fontWeight: "600" },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.control,
    alignItems: "center",
    backgroundColor: colors.accent,
  },
  acceptText: { color: colors.textPrimary, fontWeight: "600" },
  receiptCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  receiptText: { flex: 1, fontSize: typography.secondary.fontSize, color: colors.success, fontWeight: "500" },
});
