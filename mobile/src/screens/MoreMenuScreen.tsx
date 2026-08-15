import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MoreStackParamList } from "../navigation/MoreStack";

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
];

export default function MoreMenuScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.row}
          onPress={() => navigation.navigate(item.route)}
        >
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={20} color="#4f46e5" />
          </View>
          <View style={styles.textGroup}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: { flex: 1 },
  label: { fontSize: 15, fontWeight: "600" },
  description: { fontSize: 12, color: "#999", marginTop: 2 },
});
