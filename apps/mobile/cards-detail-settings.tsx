import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { getPortfolioCard, portfolioCards } from "@/data/cards";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

interface CardSettingItem {
  title: string;
  description: string;
  icon: IconName;
  type: "toggle" | "navigate" | "action";
  value?: boolean;
}

interface CardSettingSection {
  title: string;
  items: CardSettingItem[];
}

function getCardSettingSections(cardTitle: string, cardCurrency: string): CardSettingSection[] {
  return [
    {
      title: "Sécurité",
      items: [
        {
          title: "Paiements en ligne",
          description: "Autoriser les achats e-commerce avec cette carte.",
          icon: "language",
          type: "toggle",
          value: true,
        },
        {
          title: "Paiements sans contact",
          description: "Activer les paiements NFC et tap-to-pay.",
          icon: "contactless",
          type: "toggle",
          value: true,
        },
        {
          title: "Paiements à l'étranger",
          description: `Autoriser les paiements hors zone ${cardCurrency || "principale"}.`,
          icon: "public",
          type: "toggle",
          value: true,
        },
      ],
    },
    {
      title: "Contrôles",
      items: [
        {
          title: "Plafonds de paiement",
          description: "Ajuster les limites quotidiennes et mensuelles.",
          icon: "tune",
          type: "navigate",
        },
        {
          title: "Code PIN",
          description: "Afficher ou régénérer le code PIN sécurisé.",
          icon: "pin",
          type: "navigate",
        },
        {
          title: "Appareils liés",
          description: `Gérer Apple Pay et les wallets connectés à ${cardTitle}.`,
          icon: "smartphone",
          type: "navigate",
        },
      ],
    },
    {
      title: "Cycle de vie",
      items: [
        {
          title: "Renouveler la carte",
          description: "Commander une nouvelle carte ou relancer sa fabrication.",
          icon: "autorenew",
          type: "action",
        },
        {
          title: "Geler temporairement",
          description: "Suspendre immédiatement tous les paiements.",
          icon: "ac-unit",
          type: "action",
        },
        {
          title: "Opposer définitivement",
          description: "Bloquer cette carte en cas de perte ou compromission.",
          icon: "block",
          type: "action",
        },
      ],
    },
  ];
}

export default function CardsDetailSettingsScreen() {
  const insets = usePhoneSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const rawId = Array.isArray(id) ? id[0] : id;
  const decodedId = rawId ? decodeURIComponent(rawId) : "";
  const card = getPortfolioCard(decodedId) ?? portfolioCards[0];
  const sections = React.useMemo(() => getCardSettingSections(card.title, card.currency), [card.currency, card.title]);
  const [settings, setSettings] = React.useState(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.type === "toggle" && item.value !== undefined) {
          initial[item.title] = item.value;
        }
      });
    });
    return initial;
  });

  const handleBack = React.useCallback(() => {
    router.push({
      pathname: "/cards-detail",
      params: { id: card.id },
    });
  }, [card.id]);

  const handleToggle = React.useCallback((title: string) => {
    setSettings((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const handleItemPress = React.useCallback((item: CardSettingItem) => {
    if (item.type === "toggle") {
      handleToggle(item.title);
      return;
    }

    if (item.type === "action") {
      if (item.title === "Opposer définitivement") {
        Alert.alert(
          "Opposer définitivement",
          `Cette action bloquera ${card.title} de manière irréversible.`,
          [
            { text: "Annuler", style: "cancel" },
            { text: "Confirmer", style: "destructive" },
          ],
        );
        return;
      }

      Alert.alert(item.title, item.description, [{ text: "OK" }]);
      return;
    }

    Alert.alert(item.title, item.description, [{ text: "OK" }]);
  }, [card.title, handleToggle]);

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
            <Pressable style={styles.headerButton} onPress={handleBack}>
              <MaterialIcons name="arrow-back" size={20} color="#111827" />
            </Pressable>
            <Pressable
              style={styles.headerButton}
              onPress={() => Alert.alert("Aide", "Les réglages avancés de carte seront bientôt connectés au backend.")}
            >
              <MaterialIcons name="help-outline" size={20} color="#111827" />
            </Pressable>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <MaterialIcons name="settings" size={16} color="#111827" />
              <Text style={styles.heroBadgeText}>Carte</Text>
            </View>
            <Text style={styles.pageTitle}>Paramètres</Text>
            <Text style={styles.pageSubtitle}>Configurez {card.title} et ses autorisations de paiement.</Text>

            <View style={styles.cardSummary}>
              <View style={styles.cardSummaryIcon}>
                <MaterialIcons name="credit-card" size={18} color="#111827" />
              </View>
              <View style={styles.cardSummaryCopy}>
                <Text style={styles.cardSummaryTitle}>{card.title}</Text>
                <Text style={styles.cardSummarySubtitle}>•• {card.last4}{card.currency ? ` · ${card.currency}` : ""}</Text>
              </View>
            </View>
          </View>

          {sections.map((section) => (
            <View key={section.title} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.title}
                  style={[styles.settingRow, index < section.items.length - 1 && styles.settingRowBorder]}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.settingIcon}>
                    <MaterialIcons name={item.icon} size={18} color="#111827" />
                  </View>
                  <View style={styles.settingCopy}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                  {item.type === "toggle" ? (
                    <Switch
                      value={settings[item.title]}
                      onValueChange={() => handleToggle(item.title)}
                      trackColor={{ false: "#E5E7EB", true: "#111827" }}
                      thumbColor="#FFFFFF"
                    />
                  ) : (
                    <MaterialIcons
                      name="chevron-right"
                      size={18}
                      color={item.title === "Opposer définitivement" ? "#EF4444" : "#D1D5DB"}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          ))}
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
  heroCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
  },
  heroBadgeText: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  pageTitle: {
    color: "#05070A",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 14,
  },
  pageSubtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: 4,
  },
  cardSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#F9FAFB",
  },
  cardSummaryIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
  },
  cardSummaryCopy: {
    flex: 1,
  },
  cardSummaryTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  cardSummarySubtitle: {
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
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  settingIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  settingCopy: {
    flex: 1,
    minWidth: 0,
  },
  settingTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  settingDescription: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
});
