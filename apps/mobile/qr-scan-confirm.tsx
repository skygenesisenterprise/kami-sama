import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { accounts } from "@/data/accounts";

function formatAmount(amountMinor: number, currency: "EUR" | "USD") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export default function QrScanConfirmScreen() {
  const insets = usePhoneSafeAreaInsets();
  const params = useLocalSearchParams<{
    accountId?: string;
    amountMinor?: string;
    currency?: string;
    merchantName?: string;
    merchantCity?: string;
    label?: string;
    reference?: string;
  }>();

  const accountId = typeof params.accountId === "string" ? params.accountId : undefined;
  const account = accounts.find((currentAccount) => currentAccount.id === accountId) ?? accounts[0];
  const amountMinor = typeof params.amountMinor === "string" ? Number.parseInt(params.amountMinor, 10) : 0;
  const currency = params.currency === "USD" ? "USD" : "EUR";
  const merchantName = typeof params.merchantName === "string" ? params.merchantName : "Marchand inconnu";
  const merchantCity = typeof params.merchantCity === "string" ? params.merchantCity : "Ville non precisee";
  const label = typeof params.label === "string" ? params.label : "Paiement QR";
  const reference = typeof params.reference === "string" ? params.reference : "ATH-QR-UNKNOWN";

  const handleConfirm = React.useCallback(() => {
    Alert.alert(
      "Paiement confirme",
      `Le paiement de ${formatAmount(amountMinor, currency)} vers ${merchantName} a ete simule avec succes.`,
      [
        {
          text: "Retour a l'accueil",
          onPress: () => router.replace("/home"),
        },
      ],
    );
  }, [amountMinor, currency, merchantName]);

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle}>Confirmation du paiement</Text>
              <Text style={styles.headerSubtitle}>
                Verifiez le marchand et le montant avant de valider l'operation.
              </Text>
            </View>
            <Pressable style={styles.closeButton} onPress={() => router.back()}>
              <MaterialIcons name="close" size={22} color="#111827" />
            </Pressable>
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Montant a payer</Text>
            <Text style={styles.heroAmount}>{formatAmount(amountMinor, currency)}</Text>
            <Text style={styles.heroMerchant}>{merchantName}</Text>
            <Text style={styles.heroMeta}>{merchantCity} · {label}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Details du paiement</Text>
            <DetailRow label="Marchand" value={merchantName} />
            <DetailRow label="Ville" value={merchantCity} />
            <DetailRow label="Motif" value={label} />
            <DetailRow label="Reference" value={reference} />
            <DetailRow label="Compte debite" value={account.label} />
            <DetailRow label="Titulaire" value={account.holder} />
            <DetailRow label="Solde disponible" value={account.balance} last />
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <MaterialIcons name="info-outline" size={18} color="#1D4ED8" />
              <Text style={styles.tipTitle}>Prototype client</Text>
            </View>
            <Text style={styles.tipText}>
              Cette validation simule uniquement un paiement QR. Aucun debit bancaire reel n'est effectue.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>Modifier le scan</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={handleConfirm}>
              <Text style={styles.primaryButtonText}>Payer {formatAmount(amountMinor, currency)}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function DetailRow({
  label,
  last,
  value,
}: {
  label: string;
  last?: boolean;
  value: string;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: "#05070A",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    marginBottom: 6,
  },
  headerSubtitle: {
    color: "#5B6577",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DCE1EA",
    backgroundColor: "#FFFFFF",
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE1EA",
  },
  heroLabel: {
    color: "#697386",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroAmount: {
    color: "#05070A",
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    marginBottom: 10,
  },
  heroMerchant: {
    color: "#111827",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroMeta: {
    color: "#697386",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  sectionCard: {
    borderRadius: 24,
    padding: 20,
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE1EA",
  },
  sectionTitle: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 11,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailLabel: {
    flex: 1,
    color: "#697386",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  detailValue: {
    flex: 1,
    color: "#111827",
    textAlign: "right",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  tipCard: {
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    backgroundColor: "#EFF6FF",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipTitle: {
    color: "#1D4ED8",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  tipText: {
    color: "#1E3A8A",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    marginTop: 8,
  },
  actions: {
    gap: 12,
    marginTop: 18,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#334A74",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE1EA",
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
});
