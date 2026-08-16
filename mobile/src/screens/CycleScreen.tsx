import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, parseISO } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useCycleLogs, useCreateCycleLog, useUpdateCycleLog, useDeleteCycleLog } from "../hooks/useCycle";
import CycleSummary from "../components/CycleSummary";
import { todayStr } from "../utils/date";
import type { CycleLog } from "../types";
import { ensureAndroidChannel, requestNotificationPermissions } from "../lib/notifications";
import {
  DEFAULT_CYCLE_SETTINGS,
  getCycleSettings,
  setCycleSettings,
  type CycleSettings,
} from "../lib/cycleSettings";
import { scheduleCycleNotifications } from "../lib/cycleNotifications";
import { predictNextStartFromCycleLength } from "../utils/cycle";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";

function LogPeriodControl({ ongoing }: { ongoing: CycleLog | undefined }) {
  const [startDate, setStartDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const createCycleLog = useCreateCycleLog();
  const updateCycleLog = useUpdateCycleLog();

  if (ongoing) {
    return (
      <View style={styles.card}>
        <Text style={styles.heading}>Period ongoing</Text>
        <Text style={styles.subtext}>Started {format(parseISO(ongoing.startDate), "MMM d, yyyy")}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => updateCycleLog.mutate({ id: ongoing.id, patch: { endDate: todayStr() } })}
          disabled={updateCycleLog.isPending}
        >
          {updateCycleLog.isPending ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.buttonText}>End period today</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Log a period</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>{format(startDate, "MMM d, yyyy")}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(_event, selected) => {
            setShowPicker(false);
            if (selected) setStartDate(selected);
          }}
        />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => createCycleLog.mutate({ startDate: format(startDate, "yyyy-MM-dd") })}
        disabled={createCycleLog.isPending}
      >
        {createCycleLog.isPending ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Log period start</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function CycleHistoryRow({ log }: { log: CycleLog }) {
  const deleteCycleLog = useDeleteCycleLog();
  return (
    <View style={styles.historyRow}>
      <Text style={styles.historyText}>
        {format(parseISO(log.startDate), "MMM d, yyyy")}
        {log.endDate ? ` – ${format(parseISO(log.endDate), "MMM d")}` : " (ongoing)"}
      </Text>
      <TouchableOpacity onPress={() => deleteCycleLog.mutate(log.id)}>
        <Ionicons name="trash-outline" size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
}

function CycleSettingsCard({
  settings,
  onChange,
}: {
  settings: CycleSettings;
  onChange: (next: CycleSettings) => void;
}) {
  return (
    <View style={styles.settingsCard}>
      <Text style={styles.heading}>Cycle settings</Text>
      <View style={styles.settingsRow}>
        <View style={styles.settingsField}>
          <Text style={styles.settingsLabel}>Cycle length (days)</Text>
          <TextInput
            style={styles.settingsInput}
            keyboardType="number-pad"
            defaultValue={String(settings.cycleLengthDays)}
            onEndEditing={(e) => {
              const value = Number(e.nativeEvent.text);
              if (!Number.isFinite(value) || value <= 0) return;
              onChange({ ...settings, cycleLengthDays: Math.round(value) });
            }}
          />
        </View>
        <View style={styles.settingsField}>
          <Text style={styles.settingsLabel}>Avg period length (days)</Text>
          <TextInput
            style={styles.settingsInput}
            keyboardType="number-pad"
            defaultValue={String(settings.periodLengthDays)}
            onEndEditing={(e) => {
              const value = Number(e.nativeEvent.text);
              if (!Number.isFinite(value) || value <= 0) return;
              onChange({ ...settings, periodLengthDays: Math.round(value) });
            }}
          />
        </View>
      </View>
      <Text style={styles.settingsNote}>
        Milo predicts your next period from your last logged start date + cycle length, and
        reminds you 2 days before, then checks in if you haven't logged it a day after.
      </Text>
    </View>
  );
}

export default function CycleScreen() {
  const cycleQuery = useCycleLogs();
  const [settings, setSettings] = useState<CycleSettings>(DEFAULT_CYCLE_SETTINGS);

  useEffect(() => {
    (async () => {
      await ensureAndroidChannel();
      await requestNotificationPermissions();
      setSettings(await getCycleSettings());
    })();
  }, []);

  if (cycleQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (cycleQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load cycle logs.</Text>
      </View>
    );
  }

  const logs = (cycleQuery.data ?? []).slice().sort((a, b) => b.startDate.localeCompare(a.startDate));
  const ongoing = logs.find((l) => !l.endDate);

  const handleSettingsChange = (next: CycleSettings) => {
    setSettings(next);
    setCycleSettings(next);
    const predicted = predictNextStartFromCycleLength(logs.map((l) => l.startDate), next.cycleLengthDays);
    scheduleCycleNotifications(predicted);
  };

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={logs}
      keyExtractor={(item: CycleLog) => String(item.id)}
      ListHeaderComponent={
        <View style={styles.headerGap}>
          <CycleSummary logs={logs} settings={settings} />
          <LogPeriodControl ongoing={ongoing} />
          <CycleSettingsCard settings={settings} onChange={handleSettingsChange} />
          <Text style={styles.sectionTitle}>History</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>No cycles logged yet.</Text>}
      renderItem={({ item }) => <CycleHistoryRow log={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: spacing.xs },
  headerGap: { gap: 12, marginBottom: spacing.xs },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, gap: 10 },
  heading: { fontSize: typography.body.fontSize, fontWeight: "700", color: colors.textPrimary },
  subtext: { fontSize: 13, color: colors.textSecondary },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  dateText: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  button: { backgroundColor: colors.accent, borderRadius: radius.control, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  emptyText: { fontSize: 13, color: colors.textMuted },
  settingsCard: {
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  settingsRow: { flexDirection: "row", gap: spacing.sm },
  settingsField: { flex: 1, gap: spacing.xs },
  settingsLabel: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  settingsInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.elevatedSurface,
    color: colors.textPrimary,
  },
  settingsNote: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyText: { fontSize: 13, color: colors.textPrimary },
});
