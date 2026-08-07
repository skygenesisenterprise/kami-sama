import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

const sourceAccounts = [
  { name: "Personnel · EUR", balance: "€12 450,80", availability: "Disponible" },
  { name: "Professionnel · EUR", balance: "€89 150,00", availability: "Entreprise" },
];

const destinationVaults = [
  { name: "Infrastructure", target: "Objectif 3 000 €", current: "850 €" },
  { name: "Voyage Japon", target: "Objectif 5 000 €", current: "1 240 €" },
  { name: "Réserve de sécurité", target: "Réserve verrouillée", current: "2 000 €" },
];

export default function VaultFundScreen() {
  const insets = usePhoneSafeAreaInsets();

  const handleMockSubmit = React.useCallback(() => {
    Alert.alert("Ajouter des fonds", "Parcours de versement mocké. À connecter plus tard à POST /v1/vaults/{vaultId}/fund.", [{ text: "OK" }]);
  }, []);

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable accessibilityLabel="Retour vers Vault" style={styles.headerButton} onPress={() => router.replace("/vault")}>
              <MaterialIcons name="arrow-back" size={20} color="#111827" />
            </Pressable>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.pageTitle}>Ajouter des fonds</Text>
          <Text style={styles.pageSubtitle}>Choisissez un compte source et un Vault de destination pour préparer un versement.</Text>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Compte source</Text>
            {sourceAccounts.map((account, index) => (
              <Pressable key={account.name} style={[styles.optionRow, index < sourceAccounts.length - 1 && styles.rowBorder]} onPress={() => Alert.alert(account.name, account.balance, [{ text: "OK" }])}>
                <View style={styles.optionIcon}>
                  <MaterialIcons name="account-balance-wallet" size={18} color="#111827" />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{account.name}</Text>
                  <Text style={styles.optionDescription}>{account.balance} · {account.availability}</Text>
                </View>
                <MaterialIcons name="radio-button-checked" size={18} color={index === 0 ? "#2563EB" : "#D1D5DB"} />
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Vault destinataire</Text>
            {destinationVaults.map((vault, index) => (
              <Pressable key={vault.name} style={[styles.optionRow, index < destinationVaults.length - 1 && styles.rowBorder]} onPress={() => Alert.alert(vault.name, `${vault.current}\n${vault.target}`, [{ text: "OK" }])}>
                <View style={styles.optionIcon}>
                  <MaterialIcons name="inventory-2" size={18} color="#111827" />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{vault.name}</Text>
                  <Text style={styles.optionDescription}>{vault.current} · {vault.target}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color="#9CA3AF" />
              </Pressable>
            ))}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Montant prérempli</Text>
            <Text style={styles.summaryAmount}>100,00 €</Text>
            <Text style={styles.summaryDescription}>Mock de premier versement. Le flux réel utilisera plus tard le ledger mobile Vault.</Text>
          </View>

          <Pressable accessibilityLabel="Confirmer l'ajout de fonds" style={styles.primaryButton} onPress={handleMockSubmit}>
            <Text style={styles.primaryButtonText}>Préparer le versement</Text>
          </Pressable>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
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
  headerSpacer: { width: 42, height: 42 },
  pageTitle: { color: "#05070A", fontSize: 32, lineHeight: 36, fontWeight: "900" },
  pageSubtitle: { color: "#6B7280", fontSize: 14, lineHeight: 19, fontWeight: "700", marginTop: 4, marginBottom: 18 },
  sectionCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: { color: "#05070A", fontSize: 17, lineHeight: 22, fontWeight: "900", paddingVertical: 14 },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  optionIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitle: { color: "#05070A", fontSize: 15, lineHeight: 20, fontWeight: "800" },
  optionDescription: { color: "#6B7280", fontSize: 12, lineHeight: 16, fontWeight: "600", marginTop: 2 },
  summaryCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  summaryLabel: { color: "#6B7280", fontSize: 12, lineHeight: 16, fontWeight: "700" },
  summaryAmount: { color: "#05070A", fontSize: 28, lineHeight: 33, fontWeight: "900", marginTop: 8 },
  summaryDescription: { color: "#6B7280", fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 8 },
  primaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, lineHeight: 20, fontWeight: "900" },
});
