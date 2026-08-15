import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/DashboardScreen";
import HabitsScreen from "../screens/HabitsScreen";
import RemindersScreen from "../screens/RemindersScreen";
import WaterScreen from "../screens/WaterScreen";
import GoalsScreen from "../screens/GoalsScreen";
import JournalScreen from "../screens/JournalScreen";

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dashboard: "home",
  Habits: "checkmark-circle",
  Reminders: "alarm",
  Water: "water",
  Goals: "flag",
  Journal: "book",
};

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Habits" component={HabitsScreen} />
        <Tab.Screen name="Reminders" component={RemindersScreen} />
        <Tab.Screen name="Water" component={WaterScreen} />
        <Tab.Screen name="Goals" component={GoalsScreen} />
        <Tab.Screen name="Journal" component={JournalScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
