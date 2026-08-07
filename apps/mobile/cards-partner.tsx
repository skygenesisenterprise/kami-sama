import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

interface PartnerStep {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  title: string;
  description: string;
}

const partnerSteps: PartnerStep[] = [
  {
    icon: "credit-card",
    title: "Carte physique",
    description: "Renseignez les derniers chiffres et le nom affiche sur la carte.",
  },
  {
    icon: "verified-user",
    title: "Controle securise",
    description: "Une verification forte confirme que la carte vous appartient.",
  },
  {
    icon: "sync-alt",
    title: "Portefeuille unifie",
    description: "La carte rejoint votre portefeuille Aether sans nouvelle commande.",
  },
];

export default function CardsPartnerScreen() {
  const insets = usePhoneSafeAreaInsets();
  const [lastDigits, setLastDigits] = React.useState("");
  const [cardName, setCardName] = React.useState("");

  const handleSubmit = React.useCallback(() => {
    Alert.alert(
      "Carte a lier",
      lastDigits.length >= 4
        ? `Demande de liaison preparee pour la carte ${lastDigits.slice(-4)}.`
        : "Renseignez les 4 derniers chiffres de votre carte.",
      [{ text: "OK" }],
    );
  }, [lastDigits]);

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
            <Pressable style={styles.headerButton} onPress={() => Alert.alert("Aide", "Munissez-vous de votre carte Aether active.")}>
              <MaterialIcons name="help-outline" size={20} color="#111827" />
            </Pressable>
          </View>

          <Text style={styles.pageEyebrow}>Carte existante</Text>
          <Text style={styles.pageTitle}>Lier une carte Aether</Text>
          <Text style={styles.pageSubtitle}>
            Ajoutez une carte deja emise a votre portefeuille pour gerer ses plafonds, notifications et operations.
          </Text>

          <View style={styles.previewCard}>
            <View style={styles.previewSheen} />
            <View style={[styles.previewWave, styles.previewWaveOne]} />
            <View style={[styles.previewWave, styles.previewWaveTwo]} />
            <View style={styles.previewHeader}>
              <Text style={styles.previewBrand}>AETHER</Text>
              <View style={styles.previewCurrency}>
                <MaterialIcons name="link" size={10} color="#D4D4D8" />
                <Text style={styles.previewCurrencyText}>EUR</Text>
              </View>
            </View>
            <View style={styles.previewChipRow}>
              <View style={styles.previewChip}>
                <View style={styles.previewChipCore} />
              </View>
              <MaterialIcons name="contactless" size={24} color="#B8B8B8" />
            </View>
            <Text style={styles.previewNumber}>•••• •••• •••• {lastDigits.padEnd(4, "0") || "0000"}</Text>
            <View style={styles.previewFooter}>
              <Text style={styles.previewHolder}>{cardName || "NOM SUR LA CARTE"}</Text>
              <Text style={styles.previewVisa}>VISA</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Informations carte</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom affiche</Text>
              <TextInput
                autoCapitalize="characters"
                placeholder="SKY GENESIS ENTERPRISE"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={cardName}
                onChangeText={setCardName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>4 derniers chiffres</Text>
              <TextInput
                keyboardType="number-pad"
                maxLength={4}
                placeholder="0000"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={lastDigits}
                onChangeText={(value) => setLastDigits(value.replace(/\D/g, "").slice(0, 4))}
              />
            </View>
            <Pressable style={styles.scanButton} onPress={() => router.push("/cards-partner-scan")}>
              <MaterialIcons name="qr-code-scanner" size={18} color="#111827" />
              <Text style={styles.scanButtonText}>Scanner la carte</Text>
            </Pressable>
          </View>

          <View style={styles.stepsCard}>
            {partnerSteps.map((step, index) => (
              <View key={step.title} style={[styles.stepRow, index < partnerSteps.length - 1 && styles.stepRowBorder]}>
                <View style={styles.stepIcon}>
                  <MaterialIcons name={step.icon} size={20} color="#111827" />
                </View>
                <View style={styles.stepCopy}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.primaryButton} onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>Lier cette carte</Text>
          </Pressable>
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
    marginBottom: 16,
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
  pageEyebrow: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  pageTitle: {
    color: "#05070A",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 4,
  },
  pageSubtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 18,
  },
  previewCard: {
    height: 204,
    overflow: "hidden",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    backgroundColor: "#0B0B0B",
  },
  previewSheen: {
    position: "absolute",
    top: -56,
    right: -42,
    width: 172,
    height: 286,
    borderRadius: 86,
    opacity: 0.2,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "23deg" }],
  },
  previewWave: {
    position: "absolute",
    left: -34,
    right: -34,
    height: 72,
    borderRadius: 999,
    opacity: 0.34,
    backgroundColor: "#1F2937",
  },
  previewWaveOne: {
    top: 78,
    transform: [{ rotate: "-8deg" }],
  },
  previewWaveTwo: {
    bottom: -18,
    transform: [{ rotate: "8deg" }],
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewBrand: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  previewCurrency: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewCurrencyText: {
    color: "#D4D4D8",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
  },
  previewChipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 34,
  },
  previewChip: {
    width: 42,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#D6B46A",
  },
  previewChipCore: {
    width: 22,
    height: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.22)",
    borderRadius: 4,
  },
  previewNumber: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginTop: 26,
  },
  previewFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  previewHolder: {
    flex: 1,
    color: "#D4D4D8",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  previewVisa: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "900",
    fontStyle: "italic",
  },
  formCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    color: "#05070A",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 14,
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    backgroundColor: "#F9FAFB",
  },
  scanButton: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    marginTop: 2,
    backgroundColor: "#FFFFFF",
  },
  scanButtonText: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  stepsCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
  },
  stepRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  stepIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#F3F4F6",
  },
  stepCopy: {
    flex: 1,
    minWidth: 0,
  },
  stepTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  stepDescription: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 2,
  },
  primaryButton: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#111827",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
});
