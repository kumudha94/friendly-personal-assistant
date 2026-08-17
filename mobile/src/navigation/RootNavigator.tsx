import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/DashboardScreen";
import HabitsScreen from "../screens/HabitsScreen";
import RemindersScreen from "../screens/RemindersScreen";
import MoreStack from "./MoreStack";
import AuthStack from "./AuthStack";
import { navigationRef } from "./navigationRef";
import { miloNavigationTheme } from "../theme/navigationTheme";
import { colors } from "../theme/tokens";
import { useAuth } from "../contexts/AuthContext";

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Today: "home",
  Habits: "checkmark-circle",
  Reminders: "alarm",
  More: "menu",
};

function MainTabs() {
  return (
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
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          // Dashboard shortcuts (Finance/Kitchen/Personal cards) deep-link straight into
          // MoreStack via navigate("More", { screen: "X" }), which leaves that nested stack
          // parked on X. Without this, pressing the More tab button afterwards reopens
          // wherever it was left instead of the menu list — this resets it to MoreMenu
          // whenever the tab is pressed directly, without affecting those deep-link navigates.
          tabPress: (e) => {
            const state = navigation.getState();
            const moreRoute = state.routes.find((r: { name: string }) => r.name === "More");
            if ((moreRoute?.state?.index ?? 0) > 0) {
              e.preventDefault();
              navigation.navigate("More", { screen: "MoreMenu" });
            }
          },
        })}
      />
    </Tab.Navigator>
  );
}

// Login is mandatory (same shared account as FinanceTracker and KitchenPlanner) — while
// unauthenticated, AuthStack is the only thing mounted, so there's no way to reach
// Milo's actual data screens without signing in first.
export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <NavigationContainer ref={navigationRef} theme={miloNavigationTheme}>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
