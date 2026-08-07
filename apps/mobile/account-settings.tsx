import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { type Account, accounts } from "@/data/accounts";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

function getAccountIcon(account: Account): IconName {
  if (account.type === "Épargne") {
    return "savings";
  }

  if (account.type === "Professionnel") {
    return "business";
  }

  if (account.type === "Joint") {
    return "groups";
  }

  return "account-balance-wallet";
}

function getAccountPriorityLabel(index: number) {
  if (index === 0) {
    return "Principal";
  }

  if (index === 1) {
    return "Haute";
  }

  return "Standard";
}

export default function AccountSettingsScreen() {
  const insets = usePhoneSafeAreaInsets();
  const params = useLocalSearchParams<{ accountOrder?: string; widgetOrder?: string }>();
  const initialActiveAccountIds = React.useMemo(() => {
    if (typeof params.accountOrder === "string" && params.accountOrder.length > 0) {
      return params.accountOrder
        .split(",")
        .map((accountId) => accountId.trim())
        .filter((accountId) => accounts.some((account) => account.id === accountId));
    }

    return accounts.map((account) => account.id);
  }, [params.accountOrder]);
  const [activeAccountIds, setActiveAccountIds] = React.useState<string[]>(initialActiveAccountIds);

  const orderedAccounts = React.useMemo(
    () => activeAccountIds.map((accountId) => accounts.find((account) => account.id === accountId)).filter((account): account is Account => account !== undefined),
    [activeAccountIds],
  );

  const handleSave = React.useCallback(() => {
    router.replace({
      pathname: "/home",
      params: {
        accountOrder: activeAccountIds.join(","),
        widgetOrder: typeof params.widgetOrder === "string" ? params.widgetOrder : undefined,
        updatedAt: Date.now().toString(),
      },
    });
  }, [activeAccountIds, params.widgetOrder]);

  const handleMoveAccount = React.useCallback((accountId: string, direction: "up" | "down") => {
    setActiveAccountIds((currentAccounts) => {
      const currentIndex = currentAccounts.indexOf(accountId);
      if (currentIndex === -1) {
        return currentAccounts;
      }

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= currentAccounts.length) {
        return currentAccounts;
      }

      const nextAccounts = [...currentAccounts];
      const [movedAccount] = nextAccounts.splice(currentIndex, 1);
      nextAccounts.splice(targetIndex, 0, movedAccount);
      return nextAccounts;
    });
  }, []);

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Pressable
              style={styles.closeButton}
              onPress={() =>
                router.replace({
                  pathname: "/home",
                  params: {
                    widgetOrder: typeof params.widgetOrder === "string" ? params.widgetOrder : undefined,
                  },
                })
              }
            >
              <MaterialIcons name="arrow-back" size={22} color="#111827" />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.headerEyebrow}>Accueil</Text>
              <Text style={styles.headerMeta}>{activeAccountIds.length} compte{activeAccountIds.length > 1 ? "s" : ""} priorisé{activeAccountIds.length > 1 ? "s" : ""}</Text>
            </View>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </Pressable>
          </View>

          <Text style={styles.pageTitle}>Comptes et portefeuilles</Text>
          <Text style={styles.pageDescription}>
            Définissez l'ordre d'importance sur la home. Le premier compte sera affiché en priorité dans le carrousel principal.
          </Text>

          <View style={styles.tipCard}>
            <MaterialIcons name="view-carousel" size={18} color="#111827" />
            <Text style={styles.tipText}>Le classement modifie la position des comptes sur l'accueil, comme pour l'organisation des widgets.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ordre actuel</Text>
            <View style={styles.card}>
              {orderedAccounts.map((account, index) => (
                <AccountRow
                  key={account.id}
                  account={account}
                  isLast={index === orderedAccounts.length - 1}
                  priorityLabel={getAccountPriorityLabel(index)}
                  trailing={(
                    <View style={styles.rowActions}>
                      <Pressable style={styles.iconButton} onPress={() => handleMoveAccount(account.id, "up")} disabled={index === 0}>
                        <MaterialIcons name="keyboard-arrow-up" size={18} color={index === 0 ? "#D1D5DB" : "#111827"} />
                      </Pressable>
                      <Pressable style={styles.iconButton} onPress={() => handleMoveAccount(account.id, "down")} disabled={index === orderedAccounts.length - 1}>
                        <MaterialIcons name="keyboard-arrow-down" size={18} color={index === orderedAccounts.length - 1 ? "#D1D5DB" : "#111827"} />
                      </Pressable>
                    </View>
                  )}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function AccountRow({
  account,
  isLast,
  priorityLabel,
  trailing,
}: {
  account: Account;
  isLast: boolean;
  priorityLabel: string;
  trailing: React.ReactNode;
}) {
  return (
    <View style={[styles.accountRow, !isLast && styles.accountRowSpacing]}>
      <View style={styles.accountIcon}>
        <MaterialIcons name={getAccountIcon(account)} size={20} color="#111827" />
      </View>
      <View style={styles.accountCopy}>
        <Text style={styles.accountTitle}>{account.label}</Text>
        <Text style={styles.accountDescription}>{account.meta} · {account.balance}</Text>
      </View>
      <View style={styles.priorityPill}>
        <Text style={styles.priorityPillText}>{priorityLabel}</Text>
      </View>
      {trailing}
    </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  saveButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#111827",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "900",
  },
  headerEyebrow: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerMeta: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  pageTitle: {
    color: "#05070A",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 16,
  },
  pageDescription: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    marginTop: 12,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 18,
    padding: 14,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  tipText: {
    flex: 1,
    color: "#111827",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  section: {
    marginTop: 26,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accountRowSpacing: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  accountIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
  },
  accountTitle: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  accountDescription: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  priorityPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#EEF2FF",
  },
  priorityPillText: {
    color: "#3730A3",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 4,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
});
