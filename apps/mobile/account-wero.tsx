import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

interface WeroContact {
  name: string;
  number: string;
  initials: string;
}

const weroContacts: WeroContact[] = [
  { name: "Sophie Laurent", number: "+33 6 12 34 56 78", initials: "SL" },
  { name: "Thomas Martin", number: "+33 6 98 76 54 32", initials: "TM" },
  { name: "Emma Dubois", number: "+33 7 45 67 89 01", initials: "ED" },
];

export default function AccountWeroScreen() {
  const insets = usePhoneSafeAreaInsets();

  const handleRequestPayment = React.useCallback(() => {
    Alert.alert("Demander un paiement", "Générez un lien de demande Wero — fonctionnalité à venir.", [{ text: "OK" }]);
  }, []);

  const handleContactPress = React.useCallback((contact: WeroContact) => {
    Alert.alert(contact.name, contact.number, [
      { text: "Envoyer de l'argent", onPress: () => Alert.alert("Envoi", "Fonctionnalité à venir.", [{ text: "OK" }]) },
      { text: "Fermer", style: "cancel" },
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
            <Pressable style={styles.headerButton} onPress={handleRequestPayment}>
              <MaterialIcons name="link" size={20} color="#111827" />
            </Pressable>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>Wero</Text>
            <Text style={styles.pageSubtitle}>Recevez de l'argent instantanément avec Wero.</Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <MaterialIcons name="send" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Paiement instantané européen</Text>
            <Text style={styles.heroDescription}>
              Wero vous permet de recevoir des paiements en temps réel depuis n'importe quel compte européen compatible.
            </Text>
            <Pressable style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Configurer Wero</Text>
            </Pressable>
          </View>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="bolt" size={20} color="#111827" />
              </View>
              <Text style={styles.featureTitle}>Instantané</Text>
              <Text style={styles.featureText}>Réception en quelques secondes.</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="public" size={20} color="#111827" />
              </View>
              <Text style={styles.featureTitle}>Europe</Text>
              <Text style={styles.featureText}>Disponible dans toute la zone SEPA.</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="verified" size={20} color="#111827" />
              </View>
              <Text style={styles.featureTitle}>Sécurisé</Text>
              <Text style={styles.featureText}>Authentifié par votre banque.</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="euro" size={20} color="#111827" />
              </View>
              <Text style={styles.featureTitle}>Sans frais</Text>
              <Text style={styles.featureText}>Aucun frais pour les particuliers.</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contacts récents</Text>
            </View>
            {weroContacts.map((contact, index) => (
              <Pressable
                key={contact.name}
                style={[styles.contactRow, index < weroContacts.length - 1 && styles.contactRowBorder]}
                onPress={() => handleContactPress(contact)}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitials}>{contact.initials}</Text>
                </View>
                <View style={styles.contactCopy}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color="#D1D5DB" />
              </Pressable>
            ))}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="info-outline" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                Pour recevoir via Wero, partagez votre identifiant Wero ou votre numéro de téléphone.
              </Text>
            </View>
          </View>

          <View style={styles.infoNote}>
            <MaterialIcons name="info-outline" size={14} color="#6B7280" />
            <Text style={styles.infoNoteText}>
              Wero est le nouveau standard de paiement instantané européen. Les transactions sont synchronisées avec Aether Ledger.
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
    backgroundColor: "#FFFFFF",
  },
  heroIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    marginBottom: 14,
    backgroundColor: "#111827",
  },
  heroTitle: {
    color: "#05070A",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  heroDescription: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  heroButton: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#111827",
  },
  heroButtonText: {
    color: "#FFFFFF",
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
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  contactRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  contactAvatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#111827",
  },
  contactInitials: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  contactCopy: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  contactNumber: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
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
