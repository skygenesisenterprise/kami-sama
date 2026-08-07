import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

const vaultTemplates = [
  { name: "Objectif personnel", description: "Pour voyage, achat ou projet précis.", icon: "flag" as const },
  { name: "Réserve de sécurité", description: "Fonds isolés avec accès contrôlé.", icon: "lock" as const },
  { name: "Coffre professionnel", description: "Allocation liée à un compte entreprise.", icon: "business" as const },
];

export default function VaultCreateScreen() {
  const insets = usePhoneSafeAreaInsets();

  const handleCreate = React.useCallback((templateName: string) => {
    Alert.alert("Créer un Vault", `${templateName} sélectionné. À connecter plus tard à POST /v1/vaults.`, [{ text: "OK" }]);
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

          <Text style={styles.pageTitle}>Créer un Vault</Text>
          <Text style={styles.pageSubtitle}>Choisissez un modèle de coffre puis personnalisez son objectif et ses règles plus tard.</Text>

          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Nouveau coffre</Text>
            <Text style={styles.heroTitle}>Réservez une partie de votre argent sans le transformer en produit d’investissement.</Text>
          </View>

          {vaultTemplates.map((template) => (
            <Pressable key={template.name} accessibilityLabel={`Créer ${template.name}`} style={styles.templateCard} onPress={() => handleCreate(template.name)}>
              <View style={styles.templateIcon}>
                <MaterialIcons name={template.icon} size={20} color="#111827" />
              </View>
              <View style={styles.templateCopy}>
                <Text style={styles.templateTitle}>{template.name}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
            </Pressable>
          ))}
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
  heroCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    backgroundColor: "#111827",
  },
  heroLabel: { color: "#9CA3AF", fontSize: 12, lineHeight: 16, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  heroTitle: { color: "#FFFFFF", fontSize: 22, lineHeight: 27, fontWeight: "900", marginTop: 10 },
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  templateIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  templateCopy: { flex: 1, minWidth: 0 },
  templateTitle: { color: "#05070A", fontSize: 16, lineHeight: 20, fontWeight: "900" },
  templateDescription: { color: "#6B7280", fontSize: 13, lineHeight: 18, fontWeight: "600", marginTop: 4 },
});
