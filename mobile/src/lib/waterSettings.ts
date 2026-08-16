import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "milo:water-settings";

export type WaterUnit = "glasses" | "ml" | "liters";

export type WaterSettings = {
  unit: WaterUnit;
  servingSizeMl: number; // size of one tap when unit is "glasses"
  targetMl: number; // daily target, always stored in ml
};

export const DEFAULT_WATER_SETTINGS: WaterSettings = {
  unit: "glasses",
  servingSizeMl: 250,
  targetMl: 2000,
};

export async function getWaterSettings(): Promise<WaterSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? { ...DEFAULT_WATER_SETTINGS, ...JSON.parse(raw) } : DEFAULT_WATER_SETTINGS;
}

export async function setWaterSettings(value: WaterSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

/** One tap's worth of water, in ml, given the current settings. */
export function servingMl(settings: WaterSettings): number {
  if (settings.unit === "glasses") return settings.servingSizeMl;
  if (settings.unit === "liters") return 1000;
  return 250;
}

/** Formats an ml amount for display according to the chosen unit, e.g. "6 glasses", "1500 ml", "1.5 L". */
export function formatWaterAmount(ml: number, settings: WaterSettings): string {
  if (settings.unit === "glasses") {
    return `${Math.round(ml / settings.servingSizeMl)} glasses`;
  }
  if (settings.unit === "liters") {
    return `${(ml / 1000).toFixed(1)} L`;
  }
  return `${ml} ml`;
}

/** Short unit-only label for compact chips, e.g. "6/8" for glasses, "1500/2000 ml", "1.5/2.0 L". */
export function formatWaterCompact(ml: number, settings: WaterSettings): string {
  if (settings.unit === "glasses") {
    return `${Math.round(ml / settings.servingSizeMl)}`;
  }
  if (settings.unit === "liters") {
    return `${(ml / 1000).toFixed(1)}L`;
  }
  return `${ml}`;
}

/** Converts an ml amount into the number the user would type for the current unit (e.g. glasses count, or liters). */
export function mlToUnitValue(ml: number, settings: WaterSettings): number {
  if (settings.unit === "glasses") return Math.round(ml / settings.servingSizeMl);
  if (settings.unit === "liters") return Math.round((ml / 1000) * 10) / 10;
  return ml;
}

/** Converts a unit-scale number the user typed back into ml for storage. */
export function unitValueToMl(value: number, settings: WaterSettings): number {
  if (settings.unit === "glasses") return Math.round(value * settings.servingSizeMl);
  if (settings.unit === "liters") return Math.round(value * 1000);
  return Math.round(value);
}
