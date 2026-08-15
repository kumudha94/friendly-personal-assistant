import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EmailEntryScreen from "../screens/auth/EmailEntryScreen";
import OtpScreen from "../screens/auth/OtpScreen";

export type AuthStackParamList = {
  EmailEntry: undefined;
  Otp: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmailEntry" component={EmailEntryScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ headerShown: true, title: "" }} />
    </Stack.Navigator>
  );
}
