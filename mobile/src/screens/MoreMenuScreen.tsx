import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MoreStackParamList } from "../navigation/MoreStack";
import { colors, MILO_BAR_CLEARANCE, radius, spacing } from "../theme/tokens";

type Props = NativeStackScreenProps<MoreStackParamList, "MoreMenu">;

const MENU_ITEMS: {
  route: Exclude<keyof MoreStackParamList, "MoreMenu">;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
}[] = [
  { route: "Water", icon: "water", label: "Water", description: "Quick-tap intake logging" },
  { route: "Goals", icon: "flag", label: "Goals", description: "Track goals, optionally linked to a habit" },
  { route: "Journal", icon: "book", label: "Journal", description: "Daily notes and weekly/monthly reviews" },
  { route: "Wellness", icon: "heart", label: "Wellness", description: "Mood check-ins and insights" },
  { route: "Digest", icon: "sparkles", label: "Digest", description: "Claude-generated summary of recent activity" },
  { route: "QuickAdd", icon: "flash", label: "Quick add", description: "Add a reminder, habit, or goal in plain English" },
  { route: "Weight", icon: "scale", label: "Weight", description: "Track weight over time" },
  { route: "Medications", icon: "medkit", label: "Medications", description: "Doses, refill alerts, and symptom log" },
  { route: "Cycle", icon: "calendar", label: "Cycle", description: "Track periods and predict the next one" },
  { route: "Settings", icon: "settings", label: "Settings", description: "Quiet hours and notification controls" },
  { route: "Memory", icon: "bulb", label: "Memory", description: "Things Milo remembers about you" },
];

export default function MoreMenuScreen({ navigation }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.row}
          onPress={() => navigation.navigate(item.route)}
        >
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={20} color={colors.accent} />
          </View>
          <View style={styles.textGroup}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.border} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: { flex: 1 },
  label: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  description: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
