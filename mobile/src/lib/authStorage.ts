import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "milo_token";
const USER_KEY = "milo_user";

// expo-secure-store has no web implementation (it wraps the iOS Keychain /
// Android Keystore) — it throws immediately if called there. localStorage is
// fine as a stand-in for local browser development; the app only ships as a
// native APK, where SecureStore is used for real.
const isWeb = Platform.OS === "web";

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

// Milo's own login token — single, long-lived (90d), no refresh dance (that complexity
// only existed because FinanceTracker's tokens were 15-minute access + refresh; Milo's own
// signing doesn't need that split).
export function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export function setToken(token: string): Promise<void> {
  return setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await Promise.all([deleteItem(TOKEN_KEY), deleteItem(USER_KEY)]);
}

// verify-otp is the only place the user object comes from — there's no separate /me
// endpoint to re-fetch it from, so it's cached alongside the token as plain JSON.
export async function getStoredUser<T>(): Promise<T | null> {
  const raw = await getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function setStoredUser(user: unknown): Promise<void> {
  return setItem(USER_KEY, JSON.stringify(user));
}

// Generic on-device key/value helpers for small local preferences, web-safe like the above.
export const localPref = { get: getItem, set: setItem, remove: deleteItem };
