import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFinanceSnapshot } from "../hooks/useFinanceLink";
import EmptyState from "../components/EmptyState";
import { navigate } from "../navigation/navigationRef";
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
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, paddingBottom: spacing.md + MILO_BAR_CLEARANCE },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  errorText: { color: colors.error, textAlign: "center", padding: spacing.lg },
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
});
