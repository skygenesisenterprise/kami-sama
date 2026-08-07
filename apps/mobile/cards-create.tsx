import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import {
  cardColorCategories,
  type CardColorCategory,
} from "@/data/card-designs";
import {
  getCardCreateOptionsForCategory,
  type CardCreateOption,
} from "@/data/card-create-options";

export default function CardsCreateScreen() {
  const insets = usePhoneSafeAreaInsets();
  const [activeCategory, setActiveCategory] = React.useState<CardColorCategory>("Personnelle");
  const [selectedCardTypeId, setSelectedCardTypeId] = React.useState("personal-physical");
  const cardTypeOptions = getCardCreateOptionsForCategory(activeCategory);

  const handleCategoryPress = (category: CardColorCategory) => {
    setActiveCategory(category);
    setSelectedCardTypeId(getCardCreateOptionsForCategory(category)[0]?.id ?? "");
  };

  const handleOptionPress = (option: CardCreateOption) => {
    setSelectedCardTypeId(option.id);
    router.push({
      pathname: "/cards-create-option",
      params: {
        category: activeCategory,
        type: option.id,
      },
    });
  };

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
          <Pressable style={styles.closeButton} onPress={() => router.replace("/cards")}>
            <MaterialIcons name="close" size={22} color="#111827" />
          </Pressable>

          <Text style={styles.pageTitle}>Choisissez une carte</Text>

          <View style={styles.categoryRow}>
            {cardColorCategories.map((category) => {
              const isActive = category === activeCategory;

              return (
                <Pressable
                  key={category}
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{category}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.choiceCard}>
            {cardTypeOptions.map((choice, index) => (
              <CardTypeOption
                key={choice.id}
                option={choice}
                isLast={index === cardTypeOptions.length - 1}
                isSelected={choice.id === selectedCardTypeId}
                onPress={() => handleOptionPress(choice)}
              />
            ))}
          </View>

          <Pressable style={styles.existingCardLink} onPress={() => router.push("/cards-partner")}>
            <Text style={styles.existingCardText}>Vous avez déjà une carte Aether ?</Text>
            <Text style={styles.existingCardAction}>Liez-la maintenant</Text>
          </Pressable>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function CardTypeOption({
  option,
  isLast,
  isSelected,
  onPress,
}: {
  option: CardCreateOption;
  isLast: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.choiceRow, !isLast && styles.choiceRowSpacing, isSelected && styles.choiceRowSelected]}
      onPress={onPress}
    >
      <View style={[styles.choiceIcon, isSelected && styles.choiceIconSelected]}>
        <MaterialIcons name={option.icon} size={24} color={isSelected ? "#FFFFFF" : "#111827"} />
      </View>
      <View style={styles.choiceCopy}>
        <View style={styles.choiceTitleRow}>
          <Text style={styles.choiceTitle}>{option.title}</Text>
          {option.badge ? (
            <View style={styles.choiceBadge}>
              <Text style={styles.choiceBadgeText}>{option.badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.choiceDescription}>{option.description}</Text>
      </View>
      <MaterialIcons name={isSelected ? "check-circle" : "chevron-right"} size={22} color={isSelected ? "#111827" : "#9CA3AF"} />
    </Pressable>
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
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  pageTitle: {
    color: "#05070A",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 18,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 22,
  },
  categoryPill: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
  },
  categoryPillActive: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  categoryText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  choiceCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    padding: 8,
    marginHorizontal: -8,
  },
  choiceRowSpacing: {
    marginBottom: 10,
  },
  choiceRowSelected: {
    backgroundColor: "#F3F4F6",
  },
  choiceIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  choiceIconSelected: {
    backgroundColor: "#111827",
  },
  choiceCopy: {
    flex: 1,
    minWidth: 0,
  },
  choiceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  choiceTitle: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  choiceBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#111827",
  },
  choiceBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
  },
  choiceDescription: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 2,
  },
  existingCardLink: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  existingCardText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  existingCardAction: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    marginTop: 2,
  },
});
