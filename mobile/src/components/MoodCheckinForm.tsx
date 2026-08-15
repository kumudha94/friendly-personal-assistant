import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ScaleTapPicker from "./ScaleTapPicker";
import { useMoodLogs, useSetMoodLog } from "../hooks/useMood";
import { todayStr } from "../utils/date";

export default function MoodCheckinForm() {
  const moodQuery = useMoodLogs();
  const setMoodLog = useSetMoodLog();
  const today = todayStr();
  const todayLog = (moodQuery.data ?? []).find((l) => l.date === today);

  const [moodScale, setMoodScale] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepHours, setSleepHours] = useState("7");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (todayLog) {
      setMoodScale(todayLog.moodScale);
      setEnergyLevel(todayLog.energyLevel);
      setSleepHours(String(todayLog.sleepHours));
      setNotes(todayLog.notes ?? "");
    }
    // Only re-sync when a fresh server record for today first arrives, not on every local edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayLog?.id]);

  const handleSave = () => {
    setMoodLog.mutate({
      date: today,
      moodScale,
      energyLevel,
      sleepHours: Number(sleepHours) || 0,
      notes: notes.trim() || null,
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Today's check-in</Text>
      <ScaleTapPicker label="Mood" value={moodScale} onChange={setMoodScale} />
      <ScaleTapPicker label="Energy" value={energyLevel} onChange={setEnergyLevel} />
      <View>
        <Text style={styles.label}>Sleep (hours)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={sleepHours}
          onChangeText={setSleepHours}
        />
      </View>
      <View>
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Anything worth remembering?"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={setMoodLog.isPending}>
        {setMoodLog.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{todayLog ? "Update check-in" : "Save check-in"}</Text>
        )}
      </TouchableOpacity>
      {setMoodLog.isError && (
        <Text style={styles.error}>{(setMoodLog.error as Error).message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, backgroundColor: "#f5f5f7", gap: 14 },
  heading: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 12 },
});
