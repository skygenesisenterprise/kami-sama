import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

interface EnterpriseAccount {
  id: string;
  name: string;
  balance: string;
  meta: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
}

const enterpriseAccounts: EnterpriseAccount[] = [
  { id: "sge-ops", name: "SGE Operations", balance: "€89 150,00", meta: "Compte entreprise", icon: "business" },
  { id: "sge-eur", name: "SGE Europe", balance: "€143 800,00", meta: "Filiale SGE", icon: "public" },
  { id: "aether-off", name: "Aether Office", balance: "€67 200,00", meta: "Bureau professionnel", icon: "workspaces" },
  { id: "collab-sge", name: "Collaborateur SGE", balance: "€12 400,00", meta: "Espace collaborateur", icon: "group" },
];

export default function AccountEnterpriseScreen() {
  const insets = usePhoneSafeAreaInsets();

  const handleAccountPress = React.useCallback((account: EnterpriseAccount) => {
    Alert.alert(account.name, `Solde : ${account.balance}\n${account.meta}`, [
      { text: "Transférer", onPress: () => Alert.alert("Transfert", "Fonctionnalité à venir.", [{ text: "OK" }]) },
      { text: "Fermer", style: "cancel" },
    ]);
  }, []);

  const handleManagePermissions = React.useCallback(() => {
    Alert.alert("Permissions", "Gestion des accès — fonctionnalité à venir.", [{ text: "OK" }]);
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
            <Pressable style={styles.headerButton} onPress={handleManagePermissions}>
              <MaterialIcons name="tune" size={20} color="#111827" />
            </Pressable>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>Compte SGE</Text>
            <Text style={styles.pageSubtitle}>Déplacez des fonds depuis un espace autorisé.</Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <MaterialIcons name="corporate-fare" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Sky Genesis Enterprise</Text>
            <Text style={styles.heroMeta}>Enterprise Verified · 4 sous-organisations</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>12</Text>
                <Text style={styles.heroStatLabel}>Comptes</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>3</Text>
                <Text style={styles.heroStatLabel}>Rôles actifs</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>4</Text>
                <Text style={styles.heroStatLabel}>Membres</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Comptes disponibles</Text>
            </View>
            {enterpriseAccounts.map((account, index) => (
              <Pressable
                key={account.id}
                style={[styles.accountRow, index < enterpriseAccounts.length - 1 && styles.accountRowBorder]}
                onPress={() => handleAccountPress(account)}
              >
                <View style={styles.accountIcon}>
                  <MaterialIcons name={account.icon} size={18} color="#111827" />
                </View>
                <View style={styles.accountCopy}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountMeta}>{account.meta}</Text>
                </View>
                <Text style={styles.accountBalance}>{account.balance}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="verified-user" size={20} color="#1F8A4C" />
            </View>
            <Text style={styles.infoTitle}>Accès autorisé</Text>
            <Text style={styles.infoText}>
              Vous disposez des permissions nécessaires pour transférer des fonds depuis ces espaces SGE.
            </Text>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fonctionnalités</Text>
            </View>
            <Pressable style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="swap-horiz" size={18} color="#111827" />
              </View>
              <View style={styles.featureCopy}>
                <Text style={styles.featureTitle}>Transfert entre comptes SGE</Text>
                <Text style={styles.featureText}>Déplacez des fonds entre vos entités.</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color="#D1D5DB" />
            </Pressable>
            <View style={styles.featureDivider} />
            <Pressable style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="description" size={18} color="#111827" />
              </View>
              <View style={styles.featureCopy}>
                <Text style={styles.featureTitle}>Relevés consolidés</Text>
                <Text style={styles.featureText}>Vision regroupée de tous vos comptes.</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color="#D1D5DB" />
            </Pressable>
            <View style={styles.featureDivider} />
            <Pressable style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="security" size={18} color="#111827" />
              </View>
              <View style={styles.featureCopy}>
                <Text style={styles.featureTitle}>Permissions financières</Text>
                <Text style={styles.featureText}>Gérez les accès de chaque espace.</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color="#D1D5DB" />
            </Pressable>
          </View>

          <View style={styles.infoNote}>
            <MaterialIcons name="info-outline" size={14} color="#6B7280" />
            <Text style={styles.infoNoteText}>
              Les transferts depuis un compte SGE sont soumis aux permissions financières définies dans Aether Identity.
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
  heroCard: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 24,
    marginBottom: 14,
    backgroundColor: "#111827",
  },
  heroIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  heroMeta: {
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
  },
  heroStat: {
    alignItems: "center",
    flex: 1,
  },
  heroStatValue: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },
  heroStatLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    paddingVertical: 14,
  },
  sectionTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  accountRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  accountIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
  },
  accountName: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  accountMeta: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  accountBalance: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#EAF8EF",
  },
  infoIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  infoTitle: {
    color: "#1F8A4C",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  infoText: {
    color: "#1F8A4C",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  featureIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  featureCopy: {
    flex: 1,
    minWidth: 0,
  },
  featureTitle: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
  featureText: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  featureDivider: {
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
