import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFinanceSnapshot,
  useRequestFinanceOtp,
  useUnlinkFinance,
  useVerifyFinanceOtp,
} from "../hooks/useFinanceLink";
import EmptyState from "../components/EmptyState";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";
import type { FinanceBillItem } from "../types";

const KIND_ICON: Record<FinanceBillItem["kind"], keyof typeof Ionicons.glyphMap> = {
  bill: "receipt-outline",
  insurance: "shield-checkmark-outline",
  loan: "cash-outline",
};

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function ConnectFlow() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const requestOtp = useRequestFinanceOtp();
  const verifyOtp = useVerifyFinanceOtp();

  const canSend = email.trim().length > 0 && !requestOtp.isPending;
  const canVerify = code.trim().length > 0 && !verifyOtp.isPending;

  const handleSend = () => {
    if (!canSend) return;
    requestOtp.mutate(email.trim(), { onSuccess: () => setOtpSent(true) });
  };

  const handleVerify = () => {
    if (!canVerify) return;
    verifyOtp.mutate({ email: email.trim(), code: code.trim() });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Connect FinanceTracker</Text>
      <Text style={styles.subheading}>
        Milo will send a one-time code to confirm the email, then read your upcoming bills and
        balance — read-only, nothing is ever changed in FinanceTracker.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Your FinanceTracker email"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!otpSent}
      />

      {!otpSent ? (
        <TouchableOpacity style={[styles.button, !canSend && styles.buttonDisabled]} onPress={handleSend} disabled={!canSend}>
          {requestOtp.isPending ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.buttonText}>Send code</Text>}
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="6-digit code"
            placeholderTextColor={colors.textMuted}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity style={[styles.button, !canVerify && styles.buttonDisabled]} onPress={handleVerify} disabled={!canVerify}>
            {verifyOtp.isPending ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.buttonText}>Verify</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setOtpSent(false); setCode(""); }}>
            <Text style={styles.changeEmailText}>Use a different email</Text>
          </TouchableOpacity>
        </>
      )}

      {requestOtp.isError && <Text style={styles.error}>{(requestOtp.error as Error).message}</Text>}
      {verifyOtp.isError && <Text style={styles.error}>{(verifyOtp.error as Error).message}</Text>}
    </View>
  );
}

function BillRow({ item }: { item: FinanceBillItem }) {
  return (
    <View style={styles.billRow}>
      <Ionicons name={KIND_ICON[item.kind]} size={18} color={colors.accent} />
      <View style={styles.billTextGroup}>
        <Text style={styles.billLabel}>{item.label}</Text>
        <Text style={styles.billDate}>Due {item.dueDate}</Text>
      </View>
      <Text style={styles.billAmount}>{formatCurrency(item.amount)}</Text>
    </View>
  );
}

export default function FinanceScreen() {
  const snapshotQuery = useFinanceSnapshot();
  const unlinkFinance = useUnlinkFinance();

  if (snapshotQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (snapshotQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load your finance snapshot.</Text>
      </View>
    );
  }

  const snapshot = snapshotQuery.data;

  if (!snapshot || !snapshot.linked) {
    return (
      <View style={styles.container}>
        <ConnectFlow />
      </View>
    );
  }

  const handleDisconnect = () => {
    Alert.alert("Disconnect FinanceTracker?", `Milo will stop reading data for ${snapshot.email}.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: () => unlinkFinance.mutate() },
    ]);
  };

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={snapshot.items}
      keyExtractor={(item, index) => `${item.kind}-${item.label}-${index}`}
      ListHeaderComponent={
        <View style={styles.headerGap}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Bank balance</Text>
            <Text style={styles.balanceValue}>{formatCurrency(snapshot.balance)}</Text>
            <Text style={styles.connectedEmail}>Connected as {snapshot.email}</Text>
          </View>
          {snapshot.items.length > 0 && (
            <Text style={styles.sectionTitle}>
              THIS MONTH — {formatCurrency(snapshot.totalDue)} DUE
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={<EmptyState title="Nothing due this month." subtitle="You're all caught up." />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => <BillRow item={item} />}
      ListFooterComponent={
        <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect} disabled={unlinkFinance.isPending}>
          {unlinkFinance.isPending ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Text style={styles.disconnectText}>Disconnect</Text>
          )}
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  card: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, gap: spacing.sm },
  heading: { fontSize: typography.sectionTitle.fontSize, fontWeight: "700", color: colors.textPrimary },
  subheading: { fontSize: typography.secondary.fontSize, color: colors.textMuted, lineHeight: 19 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.elevatedSurface,
    color: colors.textPrimary,
  },
  button: { backgroundColor: colors.accent, borderRadius: radius.control, paddingVertical: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.textPrimary, fontWeight: "600" },
  changeEmailText: { color: colors.textMuted, fontSize: typography.caption.fontSize, textAlign: "center" },
  error: { color: colors.error, fontSize: typography.caption.fontSize },
  list: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: spacing.xs },
  headerGap: { gap: spacing.sm, marginBottom: spacing.xs },
  balanceCard: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, alignItems: "center", gap: 2 },
  balanceLabel: { fontSize: typography.caption.fontSize, color: colors.textMuted },
  balanceValue: { fontSize: 32, fontWeight: "700", color: colors.textPrimary },
  connectedEmail: { fontSize: typography.caption.fontSize, color: colors.textMuted, marginTop: spacing.xs },
  sectionTitle: { fontSize: typography.caption.fontSize, fontWeight: "600", color: colors.textMuted, letterSpacing: 0.5 },
  separator: { height: spacing.xs },
  billRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm + 6,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billTextGroup: { flex: 1 },
  billLabel: { fontSize: typography.body.fontSize, color: colors.textPrimary },
  billDate: { fontSize: typography.caption.fontSize, color: colors.textMuted, marginTop: 2 },
  billAmount: { fontSize: typography.secondary.fontSize, fontWeight: "700", color: colors.textPrimary },
  disconnectButton: { alignItems: "center", paddingVertical: spacing.md, marginTop: spacing.sm },
  disconnectText: { color: colors.error, fontWeight: "600", fontSize: typography.secondary.fontSize },
});
