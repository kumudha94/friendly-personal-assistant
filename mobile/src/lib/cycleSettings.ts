import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "milo:cycle-settings";

export type CycleSettings = {
  cycleLengthDays: number;
  periodLengthDays: number;
};

export const DEFAULT_CYCLE_SETTINGS: CycleSettings = {
  cycleLengthDays: 28,
  periodLengthDays: 5,
};

export async function getCycleSettings(): Promise<CycleSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? { ...DEFAULT_CYCLE_SETTINGS, ...JSON.parse(raw) } : DEFAULT_CYCLE_SETTINGS;
}

export async function setCycleSettings(value: CycleSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
