import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import {
  cardColorCategories,
  getCardColorFormatsForCategory,
  type CardColorCategory,
  type CardColorFormat,
} from "@/data/card-designs";
import { cardCreateOptionsByCategory } from "@/data/card-create-options";

interface DesignCollection {
  id: string;
  title: string;
  price: string;
  formats: CardColorFormat[];
}

function isCardColorCategory(value?: string): value is CardColorCategory {
  return cardColorCategories.includes(value as CardColorCategory);
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getCardTypeTitle(category: CardColorCategory, typeId?: string) {
  return cardCreateOptionsByCategory[category].find((option) => option.id === typeId)?.title ?? "Carte";
}

function buildCollections(category: CardColorCategory): DesignCollection[] {
  return [
    {
      id: category,
      title: "Designs recommandés",
      price: "Gratuit",
      formats: getCardColorFormatsForCategory(category),
    },
  ];
}
export default function CardsCreateOptionScreen() {
  const insets = usePhoneSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; type?: string }>();
  const categoryParam = getParamValue(params.category);
  const typeParam = getParamValue(params.type);
  const category = isCardColorCategory(categoryParam) ? categoryParam : "Personnelle";
  const title = getCardTypeTitle(category, typeParam);
  const collections = buildCollections(category);
  const [selectedDesignId, setSelectedDesignId] = React.useState(collections[0]?.formats[0]?.id ?? "");

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>{title.replace("Carte ", "")}</Text>
          <Pressable style={styles.headerButton} onPress={() => Alert.alert("Aide", "Choisissez un design pour continuer.")}>
            <MaterialIcons name="help-outline" size={20} color="#111827" />
          </Pressable>
        </View>

        <ScrollView
          bounces={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
          showsVerticalScrollIndicator={false}
        >
          {collections.map((collection) => (
            <View key={collection.id} style={styles.collection}>
              <View style={styles.collectionHeader}>
                <Text style={styles.collectionTitle}>{collection.title}</Text>
                <Text style={styles.collectionPrice}>· {collection.price}</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.designRow}
              >
                {collection.formats.map((format) => (
                  <DesignCard
                    key={`${collection.id}-${format.id}`}
                    format={format}
                    isSelected={format.id === selectedDesignId}
                    onPress={() => setSelectedDesignId(format.id)}
                  />
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
          <Pressable
            style={styles.continueButton}
            onPress={() => Alert.alert("Design sélectionné", selectedDesignId || "Aucun design sélectionné")}
          >
            <Text style={styles.continueButtonText}>Continuer</Text>
          </Pressable>
        </View>
      </View>
    </ScreenTransition>
  );
}

function DesignCard({
  format,
  isSelected,
  onPress,
}: {
  format: CardColorFormat;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.designCardWrap} onPress={onPress}>
      <View
        style={[
          styles.designCard,
          {
            borderColor: isSelected ? "#111827" : format.colors.border,
          },
          isSelected && styles.designCardSelected,
        ]}
      >
        <View style={styles.designCardSheen} />
        <View style={[styles.designCardWave, styles.designCardWaveOne]} />
        <View style={[styles.designCardWave, styles.designCardWaveTwo]} />
        <View style={[styles.designCardWave, styles.designCardWaveThree]} />

        <View style={styles.designCardHeader}>
          <Text style={styles.designCardBrand}>SKY GENESIS ENTERPRISE</Text>
          <View style={styles.designCardCurrency}>
            <MaterialIcons name="link" size={10} color="#D4D4D8" />
            <Text style={styles.designCardCurrencyText}>EUR</Text>
          </View>
        </View>

        <View style={styles.designCardHardwareRow}>
          <View style={styles.designCardChip}>
            <View style={styles.designCardChipCore} />
            <View style={styles.designCardChipLineTop} />
            <View style={styles.designCardChipLineBottom} />
          </View>
          <MaterialIcons name="contactless" size={24} color="#B8B8B8" />
        </View>

        <Text style={styles.designCardLast4}>•• 0000</Text>

        <View style={styles.designCardNetworkBlock}>
          {format.network === "visa" ? (
            <Text style={styles.designCardVisa}>VISA</Text>
          ) : (
            <View style={styles.designCardMastercard}>
              <View style={styles.designCardCircleLeft} />
              <View style={styles.designCardCircleRight} />
            </View>
          )}
          <Text style={styles.designCardNetworkLabel}>{format.network}</Text>
        </View>

        {isSelected ? (
          <View style={styles.selectedBadge}>
            <MaterialIcons name="check" size={14} color="#FFFFFF" />
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.designCardName}>{format.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: "#F5F7FA",
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
  headerTitle: {
    flex: 1,
    color: "#05070A",
    textAlign: "center",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  content: {
    paddingHorizontal: 16,
  },
  collection: {
    marginBottom: 26,
  },
  collectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  collectionTitle: {
    color: "#05070A",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  collectionPrice: {
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  designRow: {
    gap: 12,
    paddingHorizontal: 4,
  },
  designCardWrap: {
    width: 268,
  },
  designCard: {
    height: 168,
    borderWidth: 2,
    borderRadius: 18,
    overflow: "hidden",
    padding: 14,
    backgroundColor: "#0B0B0B",
  },
  designCardSelected: {
    shadowColor: "#111827",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  designCardSheen: {
    position: "absolute",
    top: -32,
    right: -30,
    width: 152,
    height: 230,
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "24deg" }],
  },
  designCardWave: {
    position: "absolute",
    right: -42,
    width: 220,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    transform: [{ rotate: "-18deg" }],
  },
  designCardWaveOne: {
    top: 48,
  },
  designCardWaveTwo: {
    top: 68,
    opacity: 0.72,
  },
  designCardWaveThree: {
    top: 88,
    opacity: 0.44,
  },
  designCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  designCardBrand: {
    maxWidth: "55%",
    color: "#FFFFFF",
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  designCardCurrency: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  designCardCurrencyText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
  },
  designCardHardwareRow: {
    position: "absolute",
    left: 22,
    top: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  designCardChip: {
    width: 38,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#8C8C8C",
    borderRadius: 7,
    backgroundColor: "#BDBDBD",
  },
  designCardChipCore: {
    width: 14,
    height: 19,
    borderWidth: 1,
    borderColor: "#7A7A7A",
    borderRadius: 5,
  },
  designCardChipLineTop: {
    position: "absolute",
    top: 10,
    right: 0,
    left: 0,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
  },
  designCardChipLineBottom: {
    position: "absolute",
    right: 0,
    bottom: 10,
    left: 0,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  designCardLast4: {
    position: "absolute",
    left: 16,
    bottom: 16,
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  designCardNetworkBlock: {
    position: "absolute",
    right: 16,
    bottom: 14,
    alignItems: "center",
    minWidth: 54,
  },
  designCardVisa: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
  },
  designCardMastercard: {
    width: 42,
    height: 24,
  },
  designCardCircleLeft: {
    position: "absolute",
    left: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
  },
  designCardCircleRight: {
    position: "absolute",
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    opacity: 0.94,
  },
  designCardNetworkLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
    marginTop: 2,
  },
  selectedBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  designCardName: {
    color: "#374151",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    marginTop: 8,
  },
  footer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "rgba(245,247,250,0.96)",
  },
  continueButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    backgroundColor: "#111827",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
});
