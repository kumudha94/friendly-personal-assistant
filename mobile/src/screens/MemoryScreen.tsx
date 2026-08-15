import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCreateMemory, useDeleteMemory, useMemories, useUpdateMemory } from "../hooks/useMemories";
import EmptyState from "../components/EmptyState";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";
import type { Memory } from "../types";

function AddMemoryForm() {
  const [text, setText] = useState("");
  const createMemory = useCreateMemory();

  const canSubmit = text.trim().length > 0 && !createMemory.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createMemory.mutate({ text: text.trim() }, { onSuccess: () => setText("") });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Tell Milo something to remember</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. I prefer simple explanations"
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        multiline
      />
      <TouchableOpacity style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSubmit} disabled={!canSubmit}>
        {createMemory.isPending ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.buttonText}>Remember this</Text>}
      </TouchableOpacity>
    </View>
  );
}

function MemoryRow({ memory }: { memory: Memory }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(memory.text);
  const updateMemory = useUpdateMemory();
  const deleteMemory = useDeleteMemory();

  if (editing) {
    return (
      <View style={styles.row}>
        <TextInput
          style={styles.editInput}
          value={draft}
          onChangeText={setDraft}
          multiline
          autoFocus
        />
        <View style={styles.rowActions}>
          <TouchableOpacity
            onPress={() => {
              updateMemory.mutate({ id: memory.id, text: draft.trim() || memory.text });
              setEditing(false);
            }}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setDraft(memory.text); setEditing(false); }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{memory.text}</Text>
      <View style={styles.rowActions}>
        <TouchableOpacity onPress={() => setEditing(true)}>
          <Ionicons name="pencil-outline" size={16} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteMemory.mutate(memory.id)}>
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MemoryScreen() {
  const memoriesQuery = useMemories();

  if (memoriesQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (memoriesQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load what Milo remembers.</Text>
      </View>
    );
  }

  const memories = (memoriesQuery.data ?? []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={memories}
      keyExtractor={(item: Memory) => String(item.id)}
      ListHeaderComponent={
        <View style={styles.headerGap}>
          <AddMemoryForm />
          {memories.length > 0 && <Text style={styles.sectionTitle}>MILO REMEMBERS</Text>}
        </View>
      }
      ListEmptyComponent={
        <EmptyState title="Nothing yet." subtitle="Tell Milo something worth remembering above." />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => <MemoryRow memory={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: spacing.xs },
  headerGap: { gap: 12, marginBottom: spacing.xs },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, gap: spacing.sm },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    minHeight: 56,
    textAlignVertical: "top",
  },
  button: { backgroundColor: colors.accent, borderRadius: radius.control, paddingVertical: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  sectionTitle: { fontSize: typography.caption.fontSize, fontWeight: "600", color: colors.textMuted, letterSpacing: 0.5 },
  separator: { height: 12 },
  row: {
    padding: spacing.sm + 6,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  rowText: { fontSize: typography.body.fontSize, color: colors.textPrimary, lineHeight: 20 },
  rowActions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.md },
  editInput: {
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    padding: spacing.sm,
    minHeight: 44,
    textAlignVertical: "top",
  },
  saveText: { color: colors.accent, fontWeight: "600", fontSize: typography.caption.fontSize },
  cancelText: { color: colors.textMuted, fontSize: typography.caption.fontSize },
});
