import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import {
  getProfile,
  getQuietHours,
  setProfile as saveProfile,
  setQuietHours as saveQuietHours,
  type Profile,
  type QuietHours,
} from "../lib/settings";
import { useAuth } from "../contexts/AuthContext";
import { deleteAccount } from "../lib/api";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";

function parseTime(value: string): Date {
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => logout(),
    onError: (err: Error) => Alert.alert("Couldn't delete account", err.message),
  });
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [nameJustSaved, setNameJustSaved] = useState(false);
  const [quietHours, setQuietHoursState] = useState<QuietHours | null>(null);
  const [showPicker, setShowPicker] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    getProfile().then((loaded) => {
      setProfileState(loaded);
      setNameDraft(loaded.name);
    });
    getQuietHours().then(setQuietHoursState);
  }, []);

  const nameHasChange = profile !== null && nameDraft.trim() !== profile.name;

  const handleSaveName = () => {
    if (!profile || !nameHasChange) return;
    const next = { ...profile, name: nameDraft.trim() };
    setProfileState(next);
    saveProfile(next);
    setNameJustSaved(true);
    setTimeout(() => setNameJustSaved(false), 1500);
  };

  const update = (patch: Partial<QuietHours>) => {
    if (!quietHours) return;
    const next = { ...quietHours, ...patch };
    setQuietHoursState(next);
    saveQuietHours(next);
  };

  if (!quietHours || !profile) return null;

  function handleDeleteAccount() {
    Alert.alert(
      "Delete your Milo account?",
      "This permanently deletes your account and every habit, reminder, journal entry, and everything else Milo has stored for you. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete everything", style: "destructive", onPress: () => deleteAccountMutation.mutate() },
      ],
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.subheading}>{user?.email}</Text>
        <TouchableOpacity style={styles.logoutRow} onPress={() => logout()}>
          <Ionicons name="log-out-outline" size={18} color={colors.textPrimary} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteRow}
          onPress={handleDeleteAccount}
          disabled={deleteAccountMutation.isPending}
        >
          <Text style={styles.deleteText}>
            {deleteAccountMutation.isPending ? "Deleting…" : "Delete account"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Preferences</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Your name</Text>
        <View style={styles.nameRow}>
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="What should Milo call you?"
            placeholderTextColor={colors.textMuted}
            value={nameDraft}
            onChangeText={setNameDraft}
            onSubmitEditing={handleSaveName}
            returnKeyType="done"
          />
          {(nameHasChange || nameJustSaved) && (
            <TouchableOpacity
              style={[styles.saveNameButton, nameJustSaved && styles.saveNameButtonSaved]}
              onPress={handleSaveName}
              disabled={!nameHasChange}
            >
              <Ionicons name="checkmark" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
        {nameJustSaved && <Text style={styles.savedText}>Saved</Text>}
      </View>

      <Text style={styles.heading}>Quiet hours</Text>
      <Text style={styles.subheading}>
        Mute Milo's in-app alert and sound during this window while you have the app open.
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Enable quiet hours</Text>
          <Switch value={quietHours.enabled} onValueChange={(enabled) => update({ enabled })} />
        </View>

        <View style={styles.timeRow}>
          <TouchableOpacity style={styles.timeButton} onPress={() => setShowPicker("start")}>
            <Text style={styles.timeLabel}>Starts</Text>
            <Text style={styles.timeValue}>{quietHours.start}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timeButton} onPress={() => setShowPicker("end")}>
            <Text style={styles.timeLabel}>Ends</Text>
            <Text style={styles.timeValue}>{quietHours.end}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={parseTime(showPicker === "start" ? quietHours.start : quietHours.end)}
          mode="time"
          is24Hour
          onChange={(_event, selected) => {
            const field = showPicker;
            setShowPicker(null);
            if (selected && field) {
              update(field === "start" ? { start: formatTime(selected) } : { end: formatTime(selected) });
            }
          }}
        />
      )}

      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          Milo's reminders are scheduled directly on your device, not sent from a server. Quiet
          hours can reliably mute the in-app alert while Milo is open, but can't stop your
          phone's own notification from showing while the app is closed or backgrounded —
          there's no code running at that point to intercept it. For silence everywhere, use
          your phone's system Do Not Disturb.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: spacing.md },
  heading: { fontSize: typography.sectionTitle.fontSize, fontWeight: "700", color: colors.textPrimary },
  subheading: { fontSize: 13, color: colors.textMuted },
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.elevatedSurface,
    color: colors.textPrimary,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  nameInput: { flex: 1 },
  saveNameButton: {
    width: 40,
    height: 40,
    borderRadius: radius.control,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  saveNameButtonSaved: { backgroundColor: colors.success },
  savedText: { fontSize: typography.caption.fontSize, color: colors.success, marginTop: -spacing.xs },
  timeRow: { flexDirection: "row", gap: spacing.sm },
  timeButton: {
    flex: 1,
    padding: spacing.sm + 4,
    borderRadius: radius.control,
    backgroundColor: colors.elevatedSurface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  timeLabel: { fontSize: typography.caption.fontSize, color: colors.textMuted },
  timeValue: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  noteCard: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.elevatedSurface },
  noteText: { fontSize: typography.caption.fontSize, color: colors.textMuted, lineHeight: 18 },
  logoutRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
  logoutText: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  deleteRow: { marginTop: spacing.xs },
  deleteText: { fontSize: 13, color: colors.error, textDecorationLine: "underline" },
});
