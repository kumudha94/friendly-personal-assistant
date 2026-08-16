import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "milo:balance-hidden";

// Shared between Dashboard's Money card and the Finance screen, so toggling the eye icon in
// one place doesn't leave the other showing a mismatched state.
export async function getBalanceHidden(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw === "true";
}

export async function setBalanceHidden(hidden: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, String(hidden));
}
