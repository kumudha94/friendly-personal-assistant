import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useQuickAdd } from "../hooks/useQuickAdd";
import ActionReceipt from "../components/milo/ActionReceipt";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";

const EXAMPLES = [
  "remind me to call mom at 6pm",
  "start a daily habit to stretch every morning",
  "goal: read 12 books this year",
];

export default function QuickAddScreen() {
  const [text, setText] = useState("");
  const quickAdd = useQuickAdd();

  const canSubmit = text.trim().length > 0 && !quickAdd.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    quickAdd.mutate(text.trim(), { onSuccess: () => setText("") });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Quick add</Text>
      <Text style={styles.subheading}>
        Describe a reminder, habit, or goal in plain English — Claude figures out which and fills
        it in.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. remind me to call mom at 6"
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        multiline
      />

      <TouchableOpacity style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSubmit} disabled={!canSubmit}>
        {quickAdd.isPending ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.buttonText}>Add</Text>}
      </TouchableOpacity>

      {quickAdd.isError && <Text style={styles.error}>{(quickAdd.error as Error).message}</Text>}

      {quickAdd.isSuccess && <ActionReceipt result={quickAdd.data} />}

      <View style={styles.examplesBlock}>
        <Text style={styles.examplesTitle}>Try things like:</Text>
        {EXAMPLES.map((example) => (
          <Text key={example} style={styles.exampleText}>
            "{example}"
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: 14 },
  heading: { fontSize: typography.sectionTitle.fontSize, fontWeight: "700", color: colors.textPrimary },
  subheading: { fontSize: 13, color: colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    minHeight: 60,
    textAlignVertical: "top",
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.control,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  error: { color: colors.error, fontSize: 12 },
  examplesBlock: { gap: spacing.xs, marginTop: spacing.sm },
  examplesTitle: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  exampleText: { fontSize: 12, color: colors.textMuted, fontStyle: "italic" },
});
