import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useConnections,
  useDisconnectApp,
  useRequestConnectOtp,
  useVerifyConnectOtp,
} from "../hooks/useConnections";
import { colors, radius, spacing, typography } from "../theme/tokens";
import type { ConnectionEntry } from "../lib/api";

const APP_ICON: Record<ConnectionEntry["appId"], keyof typeof Ionicons.glyphMap> = {
  financetracker: "wallet-outline",
  kitchenplanner: "restaurant-outline",
};

const CONSENT_MESSAGE =
  "Milo will only read data you've explicitly connected — nothing is shared with anyone else, and nothing in that app is ever changed. You can disconnect at any time. A code will be sent to your email to confirm.";

export default function ConnectedAppsScreen() {
  const connectionsQuery = useConnections();
  const requestOtp = useRequestConnectOtp();
  const verifyOtp = useVerifyConnectOtp();
  const disconnect = useDisconnectApp();

  const [pendingAppId, setPendingAppId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function startConnect(app: ConnectionEntry) {
    Alert.alert(`Connect ${app.name}?`, CONSENT_MESSAGE, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send code",
        onPress: () => {
          setError(null);
          requestOtp.mutate(app.appId, {
            onSuccess: () => setPendingAppId(app.appId),
            onError: (err: Error) => Alert.alert("Couldn't send code", err.message),
          });
        },
      },
    ]);
  }

  function handleVerify() {
    if (!pendingAppId) return;
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code you were sent.");
      return;
    }
    setError(null);
    verifyOtp.mutate(
      { appId: pendingAppId, code: code.trim() },
      {
        onSuccess: () => {
          setPendingAppId(null);
          setCode("");
        },
        onError: (err: Error) => setError(err.message),
      },
    );
  }

  function handleDisconnect(app: ConnectionEntry) {
    Alert.alert(`Disconnect ${app.name}?`, "Milo will stop reading data from this app.", [
      { text: "Cancel", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: () => disconnect.mutate(app.appId) },
    ]);
  }

  if (connectionsQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const apps = connectionsQuery.data ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.intro}>
        Milo can read data from other apps you use — only apps you explicitly connect, and
        only what you've agreed to share.
      </Text>

      {apps.map((app) => (
        <View key={app.appId} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons name={APP_ICON[app.appId]} size={20} color={colors.accent} />
            </View>
            <View style={styles.textGroup}>
              <Text style={styles.appName}>{app.name}</Text>
              {app.status === "connected" && <Text style={styles.appMeta}>Connected as {app.email}</Text>}
              {app.status === "not_installed" && (
                <Text style={styles.appMetaMuted}>Not installed — ask for the install file</Text>
              )}
            </View>

            {app.status === "connectable" && (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={() => startConnect(app)}
                disabled={requestOtp.isPending}
              >
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
            )}

            {app.status === "connected" && (
              <TouchableOpacity onPress={() => handleDisconnect(app)} disabled={disconnect.isPending}>
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            )}
          </View>

          {pendingAppId === app.appId && (
            <View style={styles.otpBlock}>
              <Text style={styles.otpLabel}>Enter the 6-digit code sent to your email</Text>
              <TextInput
                style={styles.otpInput}
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
              {error && <Text style={styles.error}>{error}</Text>}
              <TouchableOpacity style={styles.verifyButton} onPress={handleVerify} disabled={verifyOtp.isPending}>
                <Text style={styles.connectButtonText}>{verifyOtp.isPending ? "Verifying…" : "Verify"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.sm },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  intro: {
    fontSize: typography.secondary.fontSize,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    lineHeight: 19,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: { flex: 1 },
  appName: { fontSize: typography.body.fontSize, fontWeight: "600", color: colors.textPrimary },
  appMeta: { fontSize: typography.caption.fontSize, color: colors.textMuted, marginTop: 2 },
  appMetaMuted: { fontSize: typography.caption.fontSize, color: colors.textMuted, marginTop: 2, fontStyle: "italic" },
  connectButton: { backgroundColor: colors.accent, borderRadius: radius.control, paddingHorizontal: 14, paddingVertical: 8 },
  connectButtonText: { color: colors.textPrimary, fontWeight: "600", fontSize: typography.caption.fontSize },
  disconnectText: { color: colors.error, fontWeight: "600", fontSize: typography.caption.fontSize },
  otpBlock: { gap: spacing.xs, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border },
  otpLabel: { fontSize: typography.caption.fontSize, color: colors.textSecondary },
  otpInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 20,
    letterSpacing: 6,
    textAlign: "center",
    color: colors.textPrimary,
    backgroundColor: colors.elevatedSurface,
  },
  error: { color: colors.error, fontSize: typography.caption.fontSize },
  verifyButton: { backgroundColor: colors.accent, borderRadius: radius.control, paddingVertical: 10, alignItems: "center" },
});
