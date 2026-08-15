import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MoreMenuScreen from "../screens/MoreMenuScreen";
import WaterScreen from "../screens/WaterScreen";
import GoalsScreen from "../screens/GoalsScreen";
import JournalScreen from "../screens/JournalScreen";
import WellnessScreen from "../screens/WellnessScreen";
import DigestScreen from "../screens/DigestScreen";
import QuickAddScreen from "../screens/QuickAddScreen";

export type MoreStackParamList = {
  MoreMenu: undefined;
  Water: undefined;
  Goals: undefined;
  Journal: undefined;
  Wellness: undefined;
  Digest: undefined;
  QuickAdd: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ title: "More" }} />
      <Stack.Screen name="Water" component={WaterScreen} options={{ title: "Water" }} />
      <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: "Goals" }} />
      <Stack.Screen name="Journal" component={JournalScreen} options={{ title: "Journal" }} />
      <Stack.Screen name="Wellness" component={WellnessScreen} options={{ title: "Wellness" }} />
      <Stack.Screen name="Digest" component={DigestScreen} options={{ title: "Digest" }} />
      <Stack.Screen name="QuickAdd" component={QuickAddScreen} options={{ title: "Quick add" }} />
    </Stack.Navigator>
  );
}
