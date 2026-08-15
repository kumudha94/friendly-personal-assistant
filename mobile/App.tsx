import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RootNavigator from "./src/navigation/RootNavigator";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
