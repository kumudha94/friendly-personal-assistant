import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RootNavigator from "./src/navigation/RootNavigator";
import MiloBar from "./src/components/milo/MiloBar";
import { colors } from "./src/theme/tokens";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <RootNavigator />
      {isAuthenticated && <MiloBar />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <StatusBar style="light" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
