import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

export default function AccountSepaScreen() {
  const insets = usePhoneSafeAreaInsets();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback((value: string) => {
    setCopied(true);
    Alert.alert("Copié", `${value} copié dans le presse-papiers.`, [{ text: "OK" }]);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleShare = React.useCallback(() => {
    Alert.alert("Partager", "Partage des coordonnées bancaires — fonctionnalité à venir.", [{ text: "OK" }]);
  }, []);

  const handleDownloadRIB = React.useCallback(() => {
    Alert.alert("Télécharger RIB", "Génération du RIB en PDF — fonctionnalité à venir.", [{ text: "OK" }]);
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
            <Pressable style={styles.headerButton} onPress={handleDownloadRIB}>
              <MaterialIcons name="file-download" size={20} color="#111827" />
            </Pressable>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>Virement SEPA</Text>
            <Text style={styles.pageSubtitle}>Rechargez votre compte par virement bancaire européen.</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="info" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.infoTitle}>Délai de réception</Text>
            <Text style={styles.infoText}>
              Les virements SEPA sont généralement reçus sous 1 à 2 jours ouvrés.
            </Text>
          </View>

          <View style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <View style={styles.accountIcon}>
                <MaterialIcons name="account-balance" size={22} color="#111827" />
              </View>
              <View style={styles.accountCopy}>
                <Text style={styles.accountLabel}>Compte à créditer</Text>
                <Text style={styles.accountName}>Aether Bank EUR</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Titulaire du compte</Text>
              <View style={styles.detailValueRow}>
                <Text style={styles.detailValue}>Liam Dispa</Text>
                <Pressable onPress={() => handleCopy("Titulaire")}>
                  <MaterialIcons name="content-copy" size={16} color="#6B7280" />
                </Pressable>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>IBAN</Text>
              <View style={styles.detailValueRow}>
                <Text style={[styles.detailValue, styles.detailValueMono]}>FR76 1695 8000 0102 0456 7890 132</Text>
                <Pressable onPress={() => handleCopy("IBAN")}>
                  <MaterialIcons name={copied ? "check" : "content-copy"} size={16} color={copied ? "#1F8A4C" : "#6B7280"} />
                </Pressable>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>BIC</Text>
              <View style={styles.detailValueRow}>
                <Text style={[styles.detailValue, styles.detailValueMono]}>AEBAFRPP</Text>
                <Pressable onPress={() => handleCopy("BIC")}>
                  <MaterialIcons name="content-copy" size={16} color="#6B7280" />
                </Pressable>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Banque</Text>
              <Text style={styles.detailValue}>Aether Bank · Paris, France</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.actionButton} onPress={() => handleCopy("IBAN")}>
              <MaterialIcons name="content-copy" size={16} color="#111827" />
              <Text style={styles.actionText}>Copier l'IBAN</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleShare}>
              <MaterialIcons name="share" size={16} color="#111827" />
              <Text style={styles.actionText}>Partager</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleDownloadRIB}>
              <MaterialIcons name="file-download" size={16} color="#111827" />
              <Text style={styles.actionText}>RIB</Text>
            </Pressable>
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Informations importantes</Text>

            <View style={styles.detailItem}>
              <MaterialIcons name="euro" size={16} color="#6B7280" />
              <Text style={styles.detailItemText}>
                Montant minimum : 0,01 € · Maximum : 100 000,00 € par virement
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="schedule" size={16} color="#6B7280" />
              <Text style={styles.detailItemText}>
                Délai standard : J+1 ouvré (SEPA) 
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="public" size={16} color="#6B7280" />
              <Text style={styles.detailItemText}>
                Zone : Zone SEPA (36 pays européens)
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="verified-user" size={16} color="#6B7280" />
              <Text style={styles.detailItemText}>
                Aucun frais sur les virements SEPA entrants
              </Text>
            </View>
          </View>

          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Derniers virements SEPA</Text>
            </View>

            <View style={styles.historyRow}>
              <View style={styles.historyIcon}>
                <MaterialIcons name="south-west" size={16} color="#1F8A4C" />
              </View>
              <View style={styles.historyCopy}>
                <Text style={styles.historyLabel}>Virement de SGE Europe</Text>
                <Text style={styles.historyDate}>12 juin 2026</Text>
              </View>
              <Text style={styles.historyAmount}>+2 500,00 €</Text>
            </View>

            <View style={styles.historyDivider} />

            <View style={styles.historyRow}>
              <View style={styles.historyIcon}>
                <MaterialIcons name="south-west" size={16} color="#1F8A4C" />
              </View>
              <View style={styles.historyCopy}>
                <Text style={styles.historyLabel}>Salaire Sky Genesis Enterprise</Text>
                <Text style={styles.historyDate}>1 juin 2026</Text>
              </View>
              <Text style={styles.historyAmount}>+8 500,00 €</Text>
            </View>
          </View>

          <View style={styles.infoNote}>
            <MaterialIcons name="info-outline" size={14} color="#6B7280" />
            <Text style={styles.infoNoteText}>
              Aether Ledger synchronise automatiquement les virements SEPA entrants. Les fonds sont crédités après confirmation.
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#111827",
  },
  infoIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  infoTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  infoText: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  accountCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  accountIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  accountCopy: {
    flex: 1,
  },
  accountLabel: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  accountName: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    marginTop: 2,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  detailValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailValue: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
    flex: 1,
  },
  detailValueMono: {
    fontFamily: "monospace",
    letterSpacing: 0.3,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  actionButton: {
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
  actionText: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  detailsTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  detailItemText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  historyCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  historyHeader: {
    marginBottom: 12,
  },
  historyTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  historyIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  historyCopy: {
    flex: 1,
  },
  historyLabel: {
    color: "#05070A",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  historyDate: {
    color: "#9CA3AF",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    marginTop: 1,
  },
  historyAmount: {
    color: "#1F8A4C",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  historyDivider: {
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
