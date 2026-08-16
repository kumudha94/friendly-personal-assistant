import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MoreMenuScreen from "../screens/MoreMenuScreen";
import WaterScreen from "../screens/WaterScreen";
import GoalsScreen from "../screens/GoalsScreen";
import JournalScreen from "../screens/JournalScreen";
import WeightScreen from "../screens/WeightScreen";
import MedicationsScreen from "../screens/MedicationsScreen";
import CycleScreen from "../screens/CycleScreen";
import SettingsScreen from "../screens/SettingsScreen";
import MemoryScreen from "../screens/MemoryScreen";
import FinanceScreen from "../screens/FinanceScreen";
import KitchenScreen from "../screens/KitchenScreen";
import ConnectedAppsScreen from "../screens/ConnectedAppsScreen";
import PersonalScreen from "../screens/PersonalScreen";

export type MoreStackParamList = {
  MoreMenu: undefined;
  Water: undefined;
  Goals: undefined;
  Journal: undefined;
  Weight: undefined;
  Medications: undefined;
  Cycle: undefined;
  Settings: undefined;
  Memory: undefined;
  Finance: undefined;
  Kitchen: undefined;
  ConnectedApps: undefined;
  Personal: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ title: "More" }} />
      <Stack.Screen name="Water" component={WaterScreen} options={{ title: "Water" }} />
      <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: "Goals" }} />
      <Stack.Screen name="Journal" component={JournalScreen} options={{ title: "Journal" }} />
      <Stack.Screen name="Weight" component={WeightScreen} options={{ title: "Weight" }} />
      <Stack.Screen name="Medications" component={MedicationsScreen} options={{ title: "Medications" }} />
      <Stack.Screen name="Cycle" component={CycleScreen} options={{ title: "Cycle" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
      <Stack.Screen name="Memory" component={MemoryScreen} options={{ title: "Memory" }} />
      <Stack.Screen name="Finance" component={FinanceScreen} options={{ title: "Finance" }} />
      <Stack.Screen name="Kitchen" component={KitchenScreen} options={{ title: "Kitchen" }} />
      <Stack.Screen name="ConnectedApps" component={ConnectedAppsScreen} options={{ title: "Connected Apps" }} />
      <Stack.Screen name="Personal" component={PersonalScreen} options={{ title: "Personal" }} />
    </Stack.Navigator>
  );
}
