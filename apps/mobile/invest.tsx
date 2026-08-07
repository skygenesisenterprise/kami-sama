import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { useTabScrollToTop } from "@/components/mobile/tab-scroll-to-top";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

interface QuickAction {
  title: string;
  icon: IconName;
}

interface Goal {
  label: string;
  current: string;
  target: string;
  percentage: number;
  icon: IconName;
}

interface Product {
  title: string;
  description: string;
  tag: string;
  icon: IconName;
}

// TODO: Connect SGE API wealth overview
const totalWealth = "€12,450.80";
const wealthChange = "+5.2 %";

// TODO: Connect Aether Ledger balances
const brokerageBalance = "€0.00";

// TODO: Connect vault goals
const goals: Goal[] = [
  { label: "Voyage Japon", current: "3 700 €", target: "5 000 €", percentage: 74, icon: "flight" },
  { label: "Infrastructure SGE", current: "6 500 €", target: "10 000 €", percentage: 65, icon: "dns" },
  { label: "Appartement", current: "2 300 €", target: "10 000 €", percentage: 23, icon: "apartment" },
];

// TODO: Connect risk profile
const allocation = [
  { label: "Liquidités", percentage: 65, color: "#111827" },
  { label: "Vaults", percentage: 20, color: "#4B5563" },
  { label: "Investissements", percentage: 15, color: "#9CA3AF" },
];

// TODO: Connect investment products endpoint
const products: Product[] = [
  { title: "Aether Savings", description: "Épargne souveraine", tag: "Bientôt disponible", icon: "savings" },
  { title: "Aether Wealth", description: "Gestion patrimoniale", tag: "Bientôt disponible", icon: "account-balance" },
  { title: "Aether Crypto", description: "Actifs numériques", tag: "Sandbox", icon: "currency-bitcoin" },
  { title: "Aether Treasury", description: "Trésorerie entreprise", tag: "Interne SGE", icon: "business" },
];

// TODO: Connect AI insights service
const insights = [
  "Vous avez épargné 830 € ce mois-ci.",
  "Votre objectif le plus avancé est Voyage Japon.",
  "Vos dépenses ont diminué de 12 %.",
];

const infrastructure = [
  { label: "Aether Ledger", status: "Operational", tone: "green" as const },
  { label: "SGE API", status: "Operational", tone: "green" as const },
  { label: "Wealth Engine", status: "Sandbox", tone: "amber" as const },
];

const quickActions: QuickAction[] = [
  { title: "Investir", icon: "trending-up" },
  { title: "Ajouter", icon: "add" },
  { title: "Retirer", icon: "remove" },
  { title: "Plus", icon: "more-horiz" },
];

export default function InvestScreen() {
  const insets = usePhoneSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);

  useTabScrollToTop("invest", scrollRef);

  return (
    <ScreenTransition>
      <View style={styles.safeArea}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <InvestHeader />

          <HeroSection />

          <QuickActionRow />

          <BrokerageCard />

          <GoalsSection />

          <AllocationSection />

          <ProductsSection />

          <InsightsCard />
          <Footer />
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function InvestHeader() {
  const [query, setQuery] = React.useState("");

  return (
    <View style={styles.headerBlock}>
      <View style={styles.header}>
        <Pressable style={styles.accountButton} onPress={() => router.push("/profile")}>
          <Text style={styles.accountInitials}>LD</Text>
          <View style={styles.accountNotificationDot} />
        </Pressable>

        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher"
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <Pressable style={styles.headerUtilityButton} onPress={() => router.push("/analytics")}>
          <MaterialIcons name="bar-chart" size={21} color="#111827" />
          <Text style={styles.headerUtilityLabel}>Analyse</Text>
        </Pressable>

        <Pressable style={styles.headerUtilityButton}>
          <MaterialIcons name="language" size={21} color="#111827" />
          <Text style={styles.headerUtilityLabel}>Portefeuille</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HeroSection() {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroBgPattern}>
        <View style={[styles.heroBgCircle, { top: -40, right: -30, width: 180, height: 180 }]} />
        <View style={[styles.heroBgCircle, { bottom: -50, left: -20, width: 140, height: 140 }]} />
      </View>
      <Text style={styles.heroLabel}>Patrimoine total</Text>
      <Text style={styles.heroValue}>{totalWealth}</Text>
      <View style={styles.heroPerformanceRow}>
        <MaterialIcons name="trending-up" size={18} color="#22C55E" />
        <Text style={styles.heroPerformanceText}>{wealthChange} ce mois-ci</Text>
      </View>
      <Text style={styles.heroRiskDisclaimer}>Risque de perte en capital</Text>
    </View>
  );
}

function QuickActionRow() {
  return (
    <View style={styles.quickActionRow}>
      {quickActions.map((action) => (
        <Pressable key={action.title} style={styles.quickAction}>
          <View style={styles.quickActionIcon}>
            <MaterialIcons name={action.icon} size={20} color="#111827" />
          </View>
          <Text style={styles.quickActionText}>{action.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function BrokerageCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Compte de courtage</Text>
      <View style={styles.brokerageContent}>
        <View style={styles.brokerageBalance}>
          <Text style={styles.brokerageLabel}>Solde</Text>
          <Text style={styles.brokerageValue}>{brokerageBalance}</Text>
        </View>
        <View style={styles.brokerageDivider} />
        <View style={styles.brokerageBalance}>
          <Text style={styles.brokerageLabel}>Devise</Text>
          <Text style={styles.brokerageValue}>€0.00</Text>
        </View>
      </View>
      {/* TODO: Connect SGE API brokerage account */}
    </View>
  );
}

function GoalsSection() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Objectifs patrimoniaux</Text>
      {goals.map((goal) => (
        <View key={goal.label} style={styles.goalRow}>
          <View style={styles.goalHeader}>
            <View style={styles.goalLeading}>
              <View style={styles.goalIcon}>
                <MaterialIcons name={goal.icon} size={16} color="#111827" />
              </View>
              <Text style={styles.goalLabel}>{goal.label}</Text>
            </View>
            <Text style={styles.goalAmount}>
              {goal.current} / {goal.target}
            </Text>
          </View>
          <View style={styles.goalTrack}>
            <View style={[styles.goalFill, { width: `${goal.percentage}%` }]} />
          </View>
          <Text style={styles.goalPercentage}>{goal.percentage} %</Text>
        </View>
      ))}
    </View>
  );
}

function AllocationSection() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Répartition du patrimoine</Text>
      <View style={styles.allocationBarTrack}>
        {allocation.map((item) => (
          <View key={item.label} style={[styles.allocationBarFill, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
        ))}
      </View>
      {allocation.map((item) => (
        <View key={item.label} style={styles.allocationRow}>
          <View style={[styles.allocationDot, { backgroundColor: item.color }]} />
          <Text style={styles.allocationLabel}>{item.label}</Text>
          <Text style={styles.allocationPercentage}>{item.percentage} %</Text>
        </View>
      ))}
    </View>
  );
}

function ProductsSection() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Produits Aether</Text>
      {products.map((product) => (
        <View key={product.title} style={styles.productRow}>
          <View style={styles.productIcon}>
            <MaterialIcons name={product.icon} size={22} color="#111827" />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
          </View>
          <View style={[styles.productTag, product.tag === "Sandbox" ? styles.productTagAmber : styles.productTagGray]}>
            <Text style={[styles.productTagText, product.tag === "Sandbox" ? styles.productTagTextAmber : styles.productTagTextGray]}>
              {product.tag}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function InsightsCard() {
  return (
    <View style={styles.insightsCard}>
      <View style={styles.insightsHeader}>
        <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />
        <Text style={styles.insightsTitle}>Aether Insights</Text>
      </View>
      {insights.map((text, i) => (
        <View key={i} style={styles.insightRow}>
          <View style={styles.insightBullet} />
          <Text style={styles.insightText}>{text}</Text>
        </View>
      ))}
      {/* TODO: Connect AI insights service */}
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerTitle}>Aether Bank</Text>
      <Text style={styles.footerVersion}>Version 1.0.0</Text>
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
  headerBlock: {
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  accountButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 22,
    backgroundColor: "#111827",
  },
  accountInitials: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  accountNotificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "#EF4444",
  },
  searchBar: {
    flex: 1,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 22,
    paddingHorizontal: 13,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    padding: 0,
  },
  headerUtilityButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  headerUtilityLabel: {
    position: "absolute",
    opacity: 0,
    fontSize: 1,
  },
  heroCard: {
    borderRadius: 18,
    padding: 24,
    marginBottom: 18,
    backgroundColor: "#111827",
    overflow: "hidden",
    position: "relative",
  },
  heroBgPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBgCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  heroLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    marginBottom: 4,
    position: "relative",
    zIndex: 1,
  },
  heroValue: {
    color: "#FFFFFF",
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "900",
    position: "relative",
    zIndex: 1,
  },
  heroPerformanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    position: "relative",
    zIndex: 1,
  },
  heroPerformanceText: {
    color: "#22C55E",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  heroRiskDisclaimer: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 12,
    position: "relative",
    zIndex: 1,
  },
  quickActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  quickAction: {
    width: "23%",
    alignItems: "center",
    gap: 7,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  quickActionText: {
    color: "#374151",
    textAlign: "center",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  card: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    marginBottom: 12,
  },
  brokerageContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  brokerageBalance: {
    flex: 1,
    alignItems: "center",
  },
  brokerageDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  brokerageLabel: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  brokerageValue: {
    color: "#05070A",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },
  goalRow: {
    marginBottom: 14,
    gap: 6,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalLeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goalIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  goalLabel: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  goalAmount: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  goalTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  goalFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#111827",
  },
  goalPercentage: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    textAlign: "right",
  },
  allocationBarTrack: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
  },
  allocationBarFill: {
    height: 8,
  },
  allocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  allocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  allocationLabel: {
    flex: 1,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },
  allocationPercentage: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  productIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  productDescription: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 1,
  },
  productTag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  productTagGray: {
    backgroundColor: "#F3F4F6",
  },
  productTagAmber: {
    backgroundColor: "#FEF3C7",
  },
  productTagText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  productTagTextGray: {
    color: "#6B7280",
  },
  productTagTextAmber: {
    color: "#D97706",
  },
  insightsCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    backgroundColor: "#087BEA",
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  insightsTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  insightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  insightText: {
    flex: 1,
    color: "#D8EBFF",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
  },
  infraRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infraLabel: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  infraStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infraDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  infraStatusText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 8,
    gap: 4,
  },
  footerTitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  footerVersion: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
  },
  footerDisclaimer: {
    color: "#9CA3AF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 2,
  },
});
