import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFinanceSnapshot } from "../hooks/useFinanceLink";
import EmptyState from "../components/EmptyState";
import { navigate } from "../navigation/navigationRef";
import { getBalanceHidden, setBalanceHidden } from "../lib/balancePrivacy";
import { colors, MILO_BAR_CLEARANCE, radius, spacing, typography } from "../theme/tokens";
import type { FinanceAccount, FinanceBillCategory, FinanceBillItem } from "../types";

const CATEGORY_META: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  scheduledPayments: { label: "Scheduled Payments", icon: "sync-outline" },
  creditCardBills: { label: "Credit Card Bills", icon: "card-outline" },
  loans: { label: "Loan EMIs", icon: "cash-outline" },
  insurance: { label: "Insurance", icon: "shield-checkmark-outline" },
};

const STATUS_COLOR: Record<string, string> = {
  paid: colors.success,
  overdue: colors.error,
  pending: colors.textMuted,
  skipped: colors.textMuted,
};

function formatCurrency(amount: number, hidden = false): string {
  return hidden ? "₹••••••" : `₹${amount.toLocaleString("en-IN")}`;
}

function AccountRow({ account, hidden }: { account: FinanceAccount; hidden: boolean }) {
  return (
    <View style={styles.accountRow}>
      <Ionicons name="business-outline" size={16} color={colors.accent} />
      <View style={styles.billTextGroup}>
        <Text style={styles.billLabel}>{account.name}</Text>
        {!!account.bankName && <Text style={styles.billDate}>{account.bankName}</Text>}
      </View>
      <Text style={styles.billAmount}>{formatCurrency(account.balance, hidden)}</Text>
    </View>
  );
}

function BillRow({ item }: { item: FinanceBillItem }) {
  return (
    <View style={styles.billRow}>
      <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] ?? colors.textMuted }]} />
      <View style={styles.billTextGroup}>
        <Text style={styles.billLabel}>{item.label}</Text>
        <Text style={styles.billDate}>
          {item.dueDate ? `Due ${item.dueDate}` : "No due date"} · {item.status}
        </Text>
      </View>
      <Text style={styles.billAmount}>{formatCurrency(item.amount)}</Text>
    </View>
  );
}

function CategorySection({ id, category }: { id: string; category: FinanceBillCategory }) {
  if (category.totalCount === 0) return null;
  const meta = CATEGORY_META[id];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Ionicons name={meta.icon} size={16} color={colors.accent} />
        <Text style={styles.sectionTitle}>{meta.label}</Text>
        <Text style={styles.sectionPaidCount}>
          {category.paidCount}/{category.totalCount} paid
        </Text>
      </View>
      {category.pendingAmount > 0 && (
        <Text style={styles.sectionPending}>{formatCurrency(category.pendingAmount)} pending</Text>
      )}
      {category.items.map((item, index) => (
        <BillRow key={`${id}-${index}`} item={item} />
      ))}
    </View>
  );
}

export default function FinanceScreen() {
  const snapshotQuery = useFinanceSnapshot();
  const [balanceHidden, setBalanceHiddenState] = useState(false);

  useEffect(() => {
    getBalanceHidden().then(setBalanceHiddenState);
  }, []);

  function toggleBalanceHidden() {
    const next = !balanceHidden;
    setBalanceHiddenState(next);
    setBalanceHidden(next);
  }

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
        <EmptyState
          title="Not connected"
          subtitle="Connect FinanceTracker from Connected Apps to see your balance and bills here."
          actionLabel="Go to Connected Apps"
          onAction={() => navigate("More", { screen: "ConnectedApps" })}
        />
      </View>
    );
  }

  const categoryEntries = Object.entries(snapshot.categories);
  const hasAnyBills = categoryEntries.some(([, c]) => c.totalCount > 0);

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeaderRow}>
          <Text style={styles.balanceLabel}>Total balance</Text>
          <TouchableOpacity onPress={toggleBalanceHidden} hitSlop={8}>
            <Ionicons
              name={balanceHidden ? "eye-off-outline" : "eye-outline"}
              size={16}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceValue}>{formatCurrency(snapshot.balance, balanceHidden)}</Text>
        <Text style={styles.connectedEmail}>Connected as {snapshot.email}</Text>
      </View>

      {snapshot.accounts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitleStandalone}>ACCOUNTS</Text>
          {snapshot.accounts.map((account, index) => (
            <AccountRow key={`${account.name}-${index}`} account={account} hidden={balanceHidden} />
          ))}
        </View>
      )}

      {hasAnyBills ? (
        <>
          <Text style={styles.cycleTitle}>
            {formatCurrency(snapshot.totalDue)} DUE — {snapshot.cycleLabel.toUpperCase()}
          </Text>
          {categoryEntries.map(([id, category]) => (
            <CategorySection key={id} id={id} category={category} />
          ))}
        </>
      ) : (
        <EmptyState title="Nothing due this cycle." subtitle="You're all caught up." />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
  list: { padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE, gap: spacing.md },
  balanceCard: { padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, alignItems: "center", gap: 2 },
  balanceHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, alignSelf: "stretch" },
  balanceLabel: { fontSize: typography.caption.fontSize, color: colors.textMuted },
  balanceValue: { fontSize: 32, fontWeight: "700", color: colors.textPrimary },
  connectedEmail: { fontSize: typography.caption.fontSize, color: colors.textMuted, marginTop: spacing.xs },
  sectionTitleStandalone: { fontSize: typography.caption.fontSize, fontWeight: "600", color: colors.textMuted, letterSpacing: 0.5 },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm + 6,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cycleTitle: {
    fontSize: typography.caption.fontSize,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: -spacing.xs,
  },

  section: { gap: spacing.xs },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  sectionTitle: { flex: 1, fontSize: typography.body.fontSize, fontWeight: "700", color: colors.textPrimary },
  sectionPaidCount: { fontSize: typography.caption.fontSize, color: colors.textMuted, fontWeight: "600" },
  sectionPending: { fontSize: typography.secondary.fontSize, color: colors.warning, fontWeight: "600" },

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
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  billTextGroup: { flex: 1 },
  billLabel: { fontSize: typography.body.fontSize, color: colors.textPrimary },
  billDate: { fontSize: typography.caption.fontSize, color: colors.textMuted, marginTop: 2 },
  billAmount: { fontSize: typography.secondary.fontSize, fontWeight: "700", color: colors.textPrimary },
});
