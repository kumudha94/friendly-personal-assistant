import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuickAdd } from "../../hooks/useQuickAdd";
import { navigate } from "../../navigation/navigationRef";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import MiloCore from "./MiloCore";
import ActionReceipt from "./ActionReceipt";

interface MiloSheetProps {
  visible: boolean;
  onClose: () => void;
  onPlanEvening: () => void;
}

export default function MiloSheet({ visible, onClose, onPlanEvening }: MiloSheetProps) {
  const SHORTCUTS: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[] = [
    { label: "Add reminder", icon: "alarm-outline", onPress: () => navigate("Reminders") },
    { label: "Plan my day", icon: "sparkles-outline", onPress: onPlanEvening },
    { label: "Log water", icon: "water-outline", onPress: () => navigate("More", { screen: "Water" }) },
    { label: "Journal", icon: "book-outline", onPress: () => navigate("More", { screen: "Journal" }) },
  ];
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const quickAdd = useQuickAdd();

  useEffect(() => {
    if (!visible) {
      setText("");
      quickAdd.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const canSubmit = text.trim().length > 0 && !quickAdd.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    quickAdd.mutate(text.trim(), { onSuccess: () => setText("") });
  };

  const coreState = quickAdd.isPending ? "thinking" : quickAdd.isSuccess ? "success" : "idle";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <MiloCore state={coreState} size={40} />
          <Text style={styles.title}>What do you need?</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Tell Milo what to remember…"
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
        />

        <TouchableOpacity style={[styles.submit, !canSubmit && styles.submitDisabled]} onPress={handleSubmit} disabled={!canSubmit}>
          {quickAdd.isPending ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.submitText}>Add</Text>}
        </TouchableOpacity>

        {quickAdd.isError && <Text style={styles.error}>{(quickAdd.error as Error).message}</Text>}
        {quickAdd.isSuccess && <ActionReceipt result={quickAdd.data} />}

        <View style={styles.shortcutsRow}>
          {SHORTCUTS.map((shortcut) => (
            <TouchableOpacity
              key={shortcut.label}
              style={styles.shortcut}
              onPress={() => {
                onClose();
                shortcut.onPress();
              }}
            >
              <Ionicons name={shortcut.icon} size={18} color={colors.accent} />
              <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.voiceRow}
          onPress={() => Alert.alert("Voice — coming soon", "\"Hey Milo\" voice commands are waiting on account approval from the wake-word provider.")}
        >
          <Ionicons name="mic-outline" size={16} color={colors.textMuted} />
          <Text style={styles.voiceLabel}>Hold to talk — coming soon</Text>
        </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    minHeight: 56,
    textAlignVertical: "top",
  },
  submit: {
    backgroundColor: colors.accent,
    borderRadius: radius.control,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: colors.textPrimary, fontWeight: "600" },
  error: { color: colors.error, fontSize: typography.caption.fontSize },
  shortcutsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xs },
  shortcut: {
    flexBasis: "47%",
    flexGrow: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: 12,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutLabel: { color: colors.textSecondary, fontSize: typography.caption.fontSize, textAlign: "center" },
  voiceRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginTop: spacing.xs, paddingVertical: 8 },
  voiceLabel: { color: colors.textMuted, fontSize: typography.caption.fontSize },
});
