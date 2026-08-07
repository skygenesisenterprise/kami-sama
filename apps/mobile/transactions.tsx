import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { getTransactionsForAccount } from "@/data/account-transactions";
import { accounts } from "@/data/accounts";
import { type Transaction, categoryConfig } from "@/data/transactions";

export default function TransactionsScreen() {
  const insets = usePhoneSafeAreaInsets();
  const params = useLocalSearchParams<{ accountId?: string }>();
  const accountId = typeof params.accountId === "string" ? params.accountId : undefined;
  const account = accounts.find((currentAccount) => currentAccount.id === accountId) ?? accounts[0];
  const scopedTransactions = getTransactionsForAccount(account.id);

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Header accountLabel={account.label} />
          <SummaryCard accountLabel={account.label} transactions={scopedTransactions} />
          <View style={styles.transactionsCard}>
            <Text style={styles.sectionTitle}>Operations du compte</Text>
            <Text style={styles.sectionSubtitle}>{account.type} · {account.holder}</Text>
            {scopedTransactions.map((transaction, index) => (
              <TransactionRow
                key={`${transaction.title}-${transaction.amount}-${index}`}
                accountId={account.id}
                transaction={transaction}
                transactionIndex={index}
                isLast={index === scopedTransactions.length - 1}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function Header({ accountLabel }: { accountLabel: string }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <MaterialIcons name="close" size={22} color="#FFFFFF" />
      </Pressable>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Toutes les transactions</Text>
        <Text style={styles.headerSubtitle}>{accountLabel}</Text>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function SummaryCard({
  accountLabel,
  transactions,
}: {
  accountLabel: string;
  transactions: Transaction[];
}) {
  const totalCredits = transactions
    .filter((transaction) => transaction.tone === "credit")
    .reduce((sum, transaction) => sum + parseFloat(transaction.amount.replace(/[^0-9.,]/g, "").replace(",", ".")), 0);
  const totalDebits = transactions
    .filter((transaction) => transaction.tone === "debit")
    .reduce((sum, transaction) => sum + parseFloat(transaction.amount.replace(/[^0-9.,]/g, "").replace(",", ".")), 0);

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryAccountLabel}>{accountLabel}</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Crédits</Text>
          <Text style={styles.summaryValueCredit}>+{totalCredits.toFixed(2).replace(".", ",")} €</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Débits</Text>
          <Text style={styles.summaryValueDebit}>-{totalDebits.toFixed(2).replace(".", ",")} €</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Opérations</Text>
          <Text style={styles.summaryValueCount}>{transactions.length}</Text>
        </View>
      </View>
    </View>
  );
}

function TransactionRow({
  accountId,
  transaction,
  transactionIndex,
  isLast,
}: {
  accountId: string;
  transaction: Transaction;
  transactionIndex: number;
  isLast: boolean;
}) {
  const category = categoryConfig[transaction.category];

  return (
    <Pressable
      style={[styles.transactionRow, isLast && styles.transactionRowLast]}
      onPress={() =>
        router.push({
          pathname: "/transaction-detail",
          params: {
            accountId,
            title: transaction.title,
            transactionIndex: String(transactionIndex),
          },
        })
      }
    >
      <View style={[styles.transactionIcon, { backgroundColor: category.bgColor }]}>
        <MaterialIcons name={transaction.icon} size={20} color={category.color} />
      </View>
      <View style={styles.transactionCopy}>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, transaction.tone === "credit" ? styles.creditAmount : styles.debitAmount]}>
          {transaction.amount}
        </Text>
        <Text style={styles.transactionCategory}>{category.label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#111827",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    color: "#05070A",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#9CA3AF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    marginTop: 1,
  },
  headerSpacer: {
    width: 42,
  },
  summaryCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  summaryAccountLabel: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  summaryLabel: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryValueCredit: {
    color: "#1F8A4C",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  summaryValueDebit: {
    color: "#111827",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  summaryValueCount: {
    color: "#05070A",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },
  transactionsCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    marginBottom: 5,
  },
  sectionSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  transactionRowLast: {
    borderBottomWidth: 0,
  },
  transactionIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  transactionCopy: {
    flex: 1,
  },
  transactionTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  transactionDescription: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 1,
  },
  transactionAmount: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  creditAmount: {
    color: "#1F8A4C",
  },
  debitAmount: {
    color: "#111827",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionCategory: {
    color: "#9CA3AF",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    marginTop: 2,
  },
});
