import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

interface VaultItem {
  id: string;
  name: string;
  balance: string;
  status: "active" | "locked" | "pending";
  lastAccess: string;
  type: string;
}

const vaults: VaultItem[] = [
  {
    id: "vault-1",
    name: "Vault Infrastructure",
    balance: "€284 500,00",
    status: "active",
    lastAccess: "Aujourd'hui, 14:30",
    type: "Coffre principal",
  },
  {
    id: "vault-2",
    name: "Coffre sécurité",
    balance: "€75 000,00",
    status: "locked",
    lastAccess: "5 juin 2026",
    type: "Coffre verrouillé",
  },
  {
    id: "vault-3",
    name: "Réserve stratégique",
    balance: "€150 000,00",
    status: "pending",
    lastAccess: "2 juin 2026",
    type: "Coffre en attente",
  },
];

const recentActivity = [
  { action: "Dépot coffre", amount: "+€10 000,00", date: "10 juin 2026" },
  { action: "Retrait coffre", amount: "-€5 000,00", date: "8 juin 2026" },
  { action: "Intérêt mensuel", amount: "+€420,00", date: "1 juin 2026" },
];

export default function AccountVaultScreen() {
  const insets = usePhoneSafeAreaInsets();
  const [selectedVault, setSelectedVault] = React.useState(0);
  const activeVault = vaults[selectedVault];

  const handleVaultPress = React.useCallback((index: number) => {
    setSelectedVault(index);
  }, []);

  const handleWithdraw = React.useCallback(() => {
    Alert.alert("Retrait", "Fonctionnalité de retrait — fonctionnalité à venir.", [{ text: "OK" }]);
  }, []);

  const handleDeposit = React.useCallback(() => {
    Alert.alert("Dépôt", "Fonctionnalité de dépôt — fonctionnalité à venir.", [{ text: "OK" }]);
  }, []);

  const handleUnlock = React.useCallback(() => {
    Alert.alert("Déverrouillage", "Authentification requise pour déverrouiller le coffre.", [
      { text: "Déverrouiller" },
      { text: "Annuler", style: "cancel" },
    ]);
  }, []);

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable style={styles.headerButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={20} color="#111827" />
            </Pressable>
            <Pressable style={styles.headerButton} onPress={handleDeposit}>
              <MaterialIcons name="add" size={20} color="#111827" />
            </Pressable>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>Coffres</Text>
            <Text style={styles.pageSubtitle}>Retirez de l'argent depuis un Vault Aether Bank.</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vaultSelector}
          >
            {vaults.map((vault, index) => {
              const isActive = index === selectedVault;
              return (
                <Pressable
                  key={vault.id}
                  style={[styles.vaultPill, isActive && styles.vaultPillActive]}
                  onPress={() => handleVaultPress(index)}
                >
                  <Text style={[styles.vaultPillText, isActive && styles.vaultPillTextActive]}>
                    {vault.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.vaultCard}>
            <View style={styles.vaultHeader}>
              <View style={styles.vaultIcon}>
                <MaterialIcons name="lock" size={24} color="#111827" />
              </View>
              <View style={styles.vaultCopy}>
                <Text style={styles.vaultName}>{activeVault.name}</Text>
                <Text style={styles.vaultType}>{activeVault.type}</Text>
              </View>
              <View style={[styles.vaultStatus, styles[`vaultStatus${activeVault.status}`]]}>
                <Text style={[styles.vaultStatusText, styles[`vaultStatusText${activeVault.status}`]]}>
                  {activeVault.status === "active" ? "Ouvert" : activeVault.status === "locked" ? "Verrouillé" : "En attente"}
                </Text>
              </View>
            </View>

            <Text style={styles.vaultBalance}>{activeVault.balance}</Text>
            <Text style={styles.vaultBalanceLabel}>Solde disponible</Text>

            <Text style={styles.vaultLastAccess}>Dernier accès : {activeVault.lastAccess}</Text>

            <View style={styles.vaultActions}>
              {activeVault.status === "locked" ? (
                <Pressable style={styles.vaultActionButton} onPress={handleUnlock}>
                  <MaterialIcons name="lock-open" size={16} color="#FFFFFF" />
                  <Text style={styles.vaultActionText}>Déverrouiller</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable style={styles.vaultActionButtonSecondary} onPress={handleDeposit}>
                    <MaterialIcons name="add" size={16} color="#111827" />
                    <Text style={styles.vaultActionTextSecondary}>Déposer</Text>
                  </Pressable>
                  <Pressable style={styles.vaultActionButton} onPress={handleWithdraw}>
                    <MaterialIcons name="remove" size={16} color="#FFFFFF" />
                    <Text style={styles.vaultActionText}>Retirer</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="security" size={20} color="#111827" />
              </View>
              <Text style={styles.featureTitle}>Sécurisé</Text>
              <Text style={styles.featureText}>Chiffrement AES-256.</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="timer" size={20} color="#111827" />
              </View>
              <Text style={styles.featureTitle}>Disponible 24/7</Text>
              <Text style={styles.featureText}>Accès permanent.</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="verified" size={20} color="#111827" />
              </View>
              <Text style={styles.featureTitle}>Ledger</Text>
              <Text style={styles.featureText}>Traçabilité totale.</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="sync" size={20} color="#111827" />
              </View>
              <Text style={styles.featureTitle}>Sync temps réel</Text>
              <Text style={styles.featureText}>Aether Ledger.</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Activité récente</Text>
            </View>
            {recentActivity.map((item, index) => (
              <View key={item.date}>
                <View style={styles.activityRow}>
                  <View style={styles.activityIcon}>
                    <MaterialIcons
                      name={item.amount.startsWith("+") ? "south-west" : "north-east"}
                      size={16}
                      color={item.amount.startsWith("+") ? "#1F8A4C" : "#111827"}
                    />
                  </View>
                  <View style={styles.activityCopy}>
                    <Text style={styles.activityLabel}>{item.action}</Text>
                    <Text style={styles.activityDate}>{item.date}</Text>
                  </View>
                  <Text style={[styles.activityAmount, item.amount.startsWith("+") ? styles.creditAmount : styles.debitAmount]}>
                    {item.amount}
                  </Text>
                </View>
                {index < recentActivity.length - 1 && <View style={styles.activityDivider} />}
              </View>
            ))}
          </View>

          <View style={styles.infoNote}>
            <MaterialIcons name="info-outline" size={14} color="#6B7280" />
            <Text style={styles.infoNoteText}>
              Les coffres Vault sont synchronisés avec Aether Ledger. Chaque transaction est immuable et horodatée.
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScreenTransition>
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
  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  titleBlock: {
    marginBottom: 14,
  },
  pageTitle: {
    color: "#05070A",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
  },
  pageSubtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: 4,
  },
  vaultSelector: {
    gap: 8,
    paddingBottom: 14,
  },
  vaultPill: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  vaultPillActive: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  vaultPillText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  vaultPillTextActive: {
    color: "#FFFFFF",
  },
  vaultCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  vaultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  vaultIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  vaultCopy: {
    flex: 1,
  },
  vaultName: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  vaultType: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  vaultStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  vaultStatusactive: {
    backgroundColor: "#EAF8EF",
  },
  vaultStatuslocked: {
    backgroundColor: "#FEF2F2",
  },
  vaultStatuspending: {
    backgroundColor: "#FEF3C7",
  },
  vaultStatusText: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  vaultStatusTextactive: {
    color: "#1F8A4C",
  },
  vaultStatusTextlocked: {
    color: "#EF4444",
  },
  vaultStatusTextpending: {
    color: "#D97706",
  },
  vaultBalance: {
    color: "#05070A",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  vaultBalanceLabel: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  vaultLastAccess: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 14,
  },
  vaultActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  vaultActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "#111827",
  },
  vaultActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  vaultActionButtonSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  vaultActionTextSecondary: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  featureCard: {
    width: "48%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  featureIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginBottom: 10,
  },
  featureTitle: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  featureText: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  activityCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  activityHeader: {
    marginBottom: 8,
  },
  activityTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  activityIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  activityCopy: {
    flex: 1,
  },
  activityLabel: {
    color: "#05070A",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  activityDate: {
    color: "#9CA3AF",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    marginTop: 1,
  },
  activityAmount: {
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
  activityDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
    marginBottom: 20,
  },
  infoNoteText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
});
