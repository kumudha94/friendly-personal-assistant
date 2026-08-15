import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/DashboardScreen";
import HabitsScreen from "../screens/HabitsScreen";
import RemindersScreen from "../screens/RemindersScreen";
import MoreStack from "./MoreStack";
import { navigationRef } from "./navigationRef";
import { miloNavigationTheme } from "../theme/navigationTheme";
import { colors } from "../theme/tokens";

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Today: "home",
  Habits: "checkmark-circle",
  Reminders: "alarm",
  More: "menu",
};

export default function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef} theme={miloNavigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
          ),
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        })}
      >
        <Tab.Screen name="Today" component={DashboardScreen} />
        <Tab.Screen name="Habits" component={HabitsScreen} />
        <Tab.Screen name="Reminders" component={RemindersScreen} />
        <Tab.Screen name="More" component={MoreStack} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
