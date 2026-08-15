import { StyleSheet, Text, View } from "react-native";

export default function RemindersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminders</Text>
      <Text style={styles.subtitle}>Create reminders and manage recurring notifications here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center" },
});
