import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import MiloSheet from "./MiloSheet";
import PlanEveningSheet from "./PlanEveningSheet";
import DigestSheet from "./DigestSheet";

const TAB_BAR_HEIGHT = 56;

export default function MiloBar() {
  const insets = useSafeAreaInsets();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [digestSheetOpen, setDigestSheetOpen] = useState(false);

  return (
    <>
      <View style={[styles.wrap, { bottom: insets.bottom + TAB_BAR_HEIGHT + spacing.sm }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.bar} activeOpacity={0.85} onPress={() => setSheetOpen(true)}>
          <Ionicons name="add" size={18} color={colors.textSecondary} />
          <Text style={styles.label}>Ask Milo…</Text>
          <TouchableOpacity
            style={styles.digestWrap}
            onPress={(e) => {
              e.stopPropagation();
              setDigestSheetOpen(true);
            }}
          >
            <Ionicons name="sparkles" size={16} color={colors.accent} />
          </TouchableOpacity>
          <View style={styles.micWrap}>
            <Ionicons name="mic" size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
      </View>

      <MiloSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onPlanEvening={() => {
          setSheetOpen(false);
          setPlanSheetOpen(true);
        }}
      />
      <PlanEveningSheet visible={planSheetOpen} onClose={() => setPlanSheetOpen(false)} />
      <DigestSheet visible={digestSheetOpen} onClose={() => setDigestSheetOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sheet,
    backgroundColor: colors.elevatedSurface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  label: { flex: 1, color: colors.textSecondary, fontSize: typography.body.fontSize },
  digestWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  micWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
});
