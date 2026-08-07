import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

interface WorkflowRule {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const initialRules: WorkflowRule[] = [
  { id: "rule-income", title: "20 % des revenus entrants", description: "Vers Réserve de sécurité à chaque crédit reçu.", enabled: true },
  { id: "rule-roundup", title: "Arrondi automatique", description: "Arrondit les paiements et verse le surplus vers Infrastructure.", enabled: true },
  { id: "rule-monthly", title: "100 € le 1er du mois", description: "Alimente Voyage Japon à date fixe.", enabled: false },
];

export default function VaultWorkflowsScreen() {
  const insets = usePhoneSafeAreaInsets();
  const [rules, setRules] = React.useState(initialRules);

  const handleToggle = React.useCallback((ruleId: string) => {
    setRules((currentRules) => currentRules.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule)));
  }, []);

  const handleCreateRule = React.useCallback(() => {
    Alert.alert("Nouvelle automatisation", "Création d'une règle mockée. À connecter plus tard à /v1/vault-automations.", [{ text: "OK" }]);
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
            <Pressable accessibilityLabel="Créer une automatisation Vault" style={styles.headerButton} onPress={handleCreateRule}>
              <MaterialIcons name="add" size={20} color="#111827" />
            </Pressable>
          </View>

          <Text style={styles.pageTitle}>Automatisations Vault</Text>
          <Text style={styles.pageSubtitle}>Orchestrez vos versements, vos arrondis et vos règles récurrentes par coffre.</Text>

          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Workflows actifs</Text>
            <Text style={styles.heroText}>Les règles ci-dessous restent locales pour cette première version, mais simulent le comportement final des Vaults.</Text>
          </View>

          <View style={styles.sectionCard}>
            {rules.map((rule, index) => (
              <View key={rule.id} style={[styles.ruleRow, index < rules.length - 1 && styles.rowBorder]}>
                <View style={styles.ruleCopy}>
                  <Text style={styles.ruleTitle}>{rule.title}</Text>
                  <Text style={styles.ruleDescription}>{rule.description}</Text>
                  <Text style={styles.ruleMeta}>{rule.enabled ? "Activée" : "Désactivée"}</Text>
                </View>
                <Switch
                  accessibilityLabel={`Basculer ${rule.title}`}
                  trackColor={{ false: "#D1D5DB", true: "#BFDBFE" }}
                  thumbColor={rule.enabled ? "#2563EB" : "#F9FAFB"}
                  value={rule.enabled}
                  onValueChange={() => handleToggle(rule.id)}
                />
              </View>
            ))}
          </View>
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
  pageTitle: { color: "#05070A", fontSize: 32, lineHeight: 36, fontWeight: "900" },
  pageSubtitle: { color: "#6B7280", fontSize: 14, lineHeight: 19, fontWeight: "700", marginTop: 4, marginBottom: 18 },
  heroCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  heroTitle: { color: "#05070A", fontSize: 18, lineHeight: 23, fontWeight: "900" },
  heroText: { color: "#6B7280", fontSize: 13, lineHeight: 18, fontWeight: "600", marginTop: 6 },
  sectionCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  ruleCopy: { flex: 1, minWidth: 0 },
  ruleTitle: { color: "#05070A", fontSize: 15, lineHeight: 20, fontWeight: "800" },
  ruleDescription: { color: "#6B7280", fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 2 },
  ruleMeta: { color: "#9CA3AF", fontSize: 11, lineHeight: 15, fontWeight: "700", marginTop: 6 },
});
