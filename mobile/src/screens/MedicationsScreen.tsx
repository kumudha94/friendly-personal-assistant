import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMedications, useMedicationLogs, useSymptomLogs } from "../hooks/useMedications";
import MedicationForm from "../components/MedicationForm";
import MedicationCard from "../components/MedicationCard";
import SymptomForm from "../components/SymptomForm";
import SymptomLogCard from "../components/SymptomLogCard";
import type { Medication, SymptomLog } from "../types";
import { colors, MILO_BAR_CLEARANCE, radius, spacing } from "../theme/tokens";

type Tab = "medications" | "symptoms";

export default function MedicationsScreen() {
  const [tab, setTab] = useState<Tab>("medications");
  const medicationsQuery = useMedications();
  const medicationLogsQuery = useMedicationLogs();
  const symptomLogsQuery = useSymptomLogs();

  const isLoading = medicationsQuery.isLoading || medicationLogsQuery.isLoading || symptomLogsQuery.isLoading;
  const isError = medicationsQuery.isError || medicationLogsQuery.isError || symptomLogsQuery.isError;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load medications/symptoms.</Text>
      </View>
    );
  }

  const medications = medicationsQuery.data ?? [];
  const medicationLogs = medicationLogsQuery.data ?? [];
  const symptomLogs = (symptomLogsQuery.data ?? [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, tab === "medications" && styles.tabButtonActive]}
          onPress={() => setTab("medications")}
        >
          <Text style={[styles.tabText, tab === "medications" && styles.tabTextActive]}>Medications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === "symptoms" && styles.tabButtonActive]}
          onPress={() => setTab("symptoms")}
        >
          <Text style={[styles.tabText, tab === "symptoms" && styles.tabTextActive]}>Symptoms</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === "medications" ? (
          <>
            <MedicationForm />
            {medications.length === 0 ? (
              <Text style={styles.emptyText}>No medications yet — add one above.</Text>
            ) : (
              medications.map((medication: Medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  logs={medicationLogs.filter((l) => l.medicationId === medication.id)}
                />
              ))
            )}
          </>
        ) : (
          <>
            <SymptomForm />
            {symptomLogs.length === 0 ? (
              <Text style={styles.emptyText}>No symptoms logged yet.</Text>
            ) : (
              symptomLogs.map((log: SymptomLog) => <SymptomLogCard key={log.id} log={log} />)
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  tabRow: { flexDirection: "row", padding: spacing.md, paddingBottom: 0, gap: spacing.sm },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.control,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  tabButtonActive: { backgroundColor: colors.accent },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  tabTextActive: { color: colors.textPrimary },
  content: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: 12 },
  emptyText: { fontSize: 13, color: colors.textMuted },
});
