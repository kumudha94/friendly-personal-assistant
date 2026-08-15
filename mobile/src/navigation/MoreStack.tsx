import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MoreMenuScreen from "../screens/MoreMenuScreen";
import WaterScreen from "../screens/WaterScreen";
import GoalsScreen from "../screens/GoalsScreen";
import JournalScreen from "../screens/JournalScreen";
import WellnessScreen from "../screens/WellnessScreen";

export type MoreStackParamList = {
  MoreMenu: undefined;
  Water: undefined;
  Goals: undefined;
  Journal: undefined;
  Wellness: undefined;
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
    </Stack.Navigator>
  );
}
