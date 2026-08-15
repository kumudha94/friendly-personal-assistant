import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "milo_access_token";
const REFRESH_TOKEN_KEY = "milo_refresh_token";
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

export function getAccessToken(): Promise<string | null> {
  return getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([setItem(ACCESS_TOKEN_KEY, accessToken), setItem(REFRESH_TOKEN_KEY, refreshToken)]);
}

export function setAccessToken(accessToken: string): Promise<void> {
  return setItem(ACCESS_TOKEN_KEY, accessToken);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([deleteItem(ACCESS_TOKEN_KEY), deleteItem(REFRESH_TOKEN_KEY), deleteItem(USER_KEY)]);
}

// FinanceTracker's verify-otp/refresh-token responses are the only place the user object
// comes from — there's no local /me endpoint to re-fetch it from, so it's cached alongside
// the tokens as a plain JSON string.
export async function getStoredUser<T>(): Promise<T | null> {
  const raw = await getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function setStoredUser(user: unknown): Promise<void> {
  return setItem(USER_KEY, JSON.stringify(user));
}
