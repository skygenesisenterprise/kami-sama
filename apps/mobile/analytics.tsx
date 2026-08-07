import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

// TODO: Connect analytics endpoint
// TODO: Connect transaction statistics
const overview = {
  monthlyExpenses: "1 245 €",
  expenseChange: "+12 % vs mois précédent",
  monthlyIncome: "8 500 €",
  incomeChange: "+3 % vs mois précédent",
  netOperations: "+7 255 €",
  netChange: "+5 % vs mois précédent",
  transactionCount: "48",
  totalAssets: "12 450.80 €",
};

// TODO: Connect Aether Ledger metrics
const expenseSparkline = [32, 48, 28, 62, 46, 38, 54, 42, 58, 36, 50, 44];
const incomeSparkline = [24, 52, 36, 68, 44, 56, 40, 60, 48, 64, 38, 55];
const netSparkline = [18, 44, 30, 56, 38, 48, 34, 50, 40, 58, 32, 46];

// TODO: Connect SGE API financial overview
const assetDistribution = [
  { label: "Personnel", percentage: 65, icon: "person" as IconName },
  { label: "Organisation", percentage: 25, icon: "business" as IconName },
  { label: "Vaults", percentage: 10, icon: "safe" as IconName },
];

const categories = [
  { icon: "dns" as IconName, label: "Infrastructure", amount: "480 €", percentage: 52 },
  { icon: "subscriptions" as IconName, label: "Abonnements", amount: "120 €", percentage: 18 },
  { icon: "restaurant" as IconName, label: "Alimentation", amount: "92 €", percentage: 14 },
  { icon: "directions-car" as IconName, label: "Transport", amount: "64 €", percentage: 10 },
];

// TODO: Connect organization analytics
const incomeSources = [
  { icon: "business-center" as IconName, label: "Sky Genesis Enterprise", amount: "+8 500 €" },
  { icon: "workspaces" as IconName, label: "Aether Office", amount: "+830 €" },
  { icon: "reply" as IconName, label: "Remboursement", amount: "+120 €" },
];

// TODO: Connect AI Insights Service
const insights = [
  "Vos dépenses ont diminué de 12 %.",
  "Votre plus grosse catégorie est Infrastructure.",
  "Vous avez économisé 830 € ce mois-ci.",
];

const goals = [
  { label: "Infrastructure", percentage: 65 },
  { label: "Appartement", percentage: 23 },
  { label: "Investissement", percentage: 48 },
];

// TODO: Connect account selector
const accounts = [
  "Tous vos comptes",
  "Personnel",
  "Organisation",
  "SGE Europe",
  "Aether Office",
];

const infrastructure = [
  { label: "Aether Ledger", status: "Operational" },
  { label: "SGE API", status: "Operational" },
  { label: "Notifications", status: "Operational" },
];

export default function AnalyticsScreen() {
  const insets = usePhoneSafeAreaInsets();

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Header />
          <AccountSelector />
          <ExpenseCard />
          <SecondaryCards />
          <AssetOverview />
          <CategorySection />
          <IncomeSection />
          <GoalsSection />
          <InsightsCard />
          <Footer />
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <MaterialIcons name="close" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function AccountSelector() {
  const [selected, setSelected] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  return (
    <View style={styles.selectorSection}>
      <Text style={styles.pageTitle}>Outils d'analyse</Text>
      <Pressable style={styles.selectorButton} onPress={() => setOpen(!open)}>
        <Text style={styles.selectorText}>{accounts[selected]}</Text>
        <MaterialIcons
          name="expand-more"
          size={20}
          color="#6B7280"
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </Pressable>
      {open && (
        <Animated.View
          entering={FadeIn.duration(200).springify().damping(24).stiffness(200)}
          exiting={FadeOut.duration(150)}
          style={styles.selectorDropdown}
        >
          {accounts.map((account, i) => (
            <Pressable
              key={account}
              style={[styles.selectorOption, i === selected && styles.selectorOptionActive]}
              onPress={() => {
                setSelected(i);
                setOpen(false);
              }}
            >
              <Text style={[styles.selectorOptionText, i === selected && styles.selectorOptionTextActive]}>
                {account}
              </Text>
              {i === selected && <MaterialIcons name="check" size={18} color="#007AFF" />}
            </Pressable>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

function ExpenseCard() {
  return (
    <View style={styles.mainCard}>
      <Text style={styles.mainCardLabel}>Dépenses du mois</Text>
      <Text style={styles.mainCardAmount}>{overview.monthlyExpenses}</Text>
      <View style={styles.mainCardChange}>
        <MaterialIcons name="trending-up" size={16} color="#BD2E2E" />
        <Text style={styles.mainCardChangeText}>{overview.expenseChange}</Text>
      </View>
      <View style={styles.sparkline}>
        {expenseSparkline.map((height, i) => (
          <View key={i} style={styles.sparklineColumn}>
            <View style={[styles.sparklineBar, { height, backgroundColor: "#BD2E2E" }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

function SecondaryCards() {
  return (
    <View style={styles.secondaryRow}>
      <View style={[styles.secondaryCard, { flex: 1 }]}>
        <Text style={styles.secondaryCardLabel}>Entrées d'argent</Text>
        <Text style={styles.secondaryCardAmount}>{overview.monthlyIncome}</Text>
        <View style={styles.secondaryCardChange}>
          <MaterialIcons name="trending-up" size={14} color="#1F8A4C" />
          <Text style={[styles.secondaryCardChangeText, { color: "#1F8A4C" }]}>{overview.incomeChange}</Text>
        </View>
        <View style={styles.sparklineSmall}>
          {incomeSparkline.map((height, i) => (
            <View key={i} style={styles.sparklineColumnSmall}>
              <View style={[styles.sparklineBarSmall, { height }]} />
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.secondaryCard, { flex: 1 }]}>
        <Text style={styles.secondaryCardLabel}>Opérations nettes</Text>
        <Text style={[styles.secondaryCardAmount, { color: "#1F8A4C" }]}>{overview.netOperations}</Text>
        <View style={styles.secondaryCardChange}>
          <MaterialIcons name="trending-up" size={14} color="#1F8A4C" />
          <Text style={[styles.secondaryCardChangeText, { color: "#1F8A4C" }]}>{overview.netChange}</Text>
        </View>
        <View style={styles.sparklineSmall}>
          {netSparkline.map((height, i) => (
            <View key={i} style={styles.sparklineColumnSmall}>
              <View style={[styles.sparklineBarSmall, { height, backgroundColor: "#1F8A4C" }]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // TODO: Connect organization analytics
}

function AssetOverview() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Vue d'ensemble</Text>
      <Text style={styles.assetTotalLabel}>Total des actifs</Text>
      <Text style={styles.assetTotalAmount}>{overview.totalAssets}</Text>
      <View style={styles.assetBars}>
        <View style={styles.assetBarTrack}>
          {assetDistribution.map((item, i) => {
            const colors = ["#111827", "#4B5563", "#9CA3AF"];
            return (
              <View
                key={item.label}
                style={[styles.assetBarFill, { width: `${item.percentage}%`, backgroundColor: colors[i] }]}
              />
            );
          })}
        </View>
        {assetDistribution.map((item, i) => {
          const colors = ["#111827", "#4B5563", "#9CA3AF"];
          return (
            <View key={item.label} style={styles.assetRow}>
              <View style={[styles.assetDot, { backgroundColor: colors[i] }]} />
              <Text style={styles.assetLabel}>{item.label}</Text>
              <Text style={styles.assetPercentage}>{item.percentage} %</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function CategorySection() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Catégories</Text>
      {categories.map((cat, i) => (
        <View key={cat.label} style={[styles.catRow, i < categories.length - 1 && styles.catRowBorder]}>
          <View style={styles.catLeading}>
            <View style={styles.catIcon}>
              <MaterialIcons name={cat.icon} size={18} color="#111827" />
            </View>
            <Text style={styles.catLabel}>{cat.label}</Text>
          </View>
          <View style={styles.catTrailing}>
            <Text style={styles.catAmount}>{cat.amount}</Text>
            <View style={styles.catPercentBadge}>
              <Text style={styles.catPercentText}>{cat.percentage}%</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function IncomeSection() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Principales entrées</Text>
      {incomeSources.map((item, i) => (
        <View key={item.label} style={[styles.incomeRow, i < incomeSources.length - 1 && styles.catRowBorder]}>
          <View style={styles.catLeading}>
            <View style={styles.catIcon}>
              <MaterialIcons name={item.icon} size={18} color="#111827" />
            </View>
            <Text style={styles.incomeLabel}>{item.label}</Text>
          </View>
          <Text style={styles.incomeAmount}>{item.amount}</Text>
        </View>
      ))}
    </View>
  );
}

function GoalsSection() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Objectifs</Text>
      {goals.map((goal) => (
        <View key={goal.label} style={styles.goalRow}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalLabel}>{goal.label}</Text>
            <Text style={styles.goalPercentage}>{goal.percentage}%</Text>
          </View>
          <View style={styles.goalTrack}>
            <View style={[styles.goalFill, { width: `${goal.percentage}%` }]} />
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
    </View>
  );
  // TODO: Connect AI Insights Service
}

function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerTitle}>Aether Bank Analytics</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#111827",
  },
  selectorSection: {
    marginBottom: 14,
    zIndex: 10,
  },
  pageTitle: {
    color: "#05070A",
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
    marginBottom: 8,
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  selectorText: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  selectorDropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  selectorOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selectorOptionActive: {
    backgroundColor: "#F3F4F6",
  },
  selectorOptionText: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  selectorOptionTextActive: {
    color: "#111827",
    fontWeight: "900",
  },
  mainCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  mainCardLabel: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  mainCardAmount: {
    color: "#05070A",
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "900",
  },
  mainCardChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginBottom: 14,
  },
  mainCardChangeText: {
    color: "#BD2E2E",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },
  sparkline: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 62,
  },
  sparklineColumn: {
    flex: 1,
    height: 62,
    justifyContent: "flex-end",
    borderRadius: 2,
    overflow: "hidden",
  },
  sparklineBar: {
    borderRadius: 2,
    minHeight: 4,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  secondaryCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  secondaryCardLabel: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  secondaryCardAmount: {
    color: "#05070A",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  secondaryCardChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
    marginBottom: 10,
  },
  secondaryCardChangeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  sparklineSmall: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 34,
  },
  sparklineColumnSmall: {
    flex: 1,
    height: 34,
    justifyContent: "flex-end",
    borderRadius: 1,
    overflow: "hidden",
  },
  sparklineBarSmall: {
    borderRadius: 1,
    minHeight: 3,
    backgroundColor: "#111827",
  },
  card: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  cardTitle: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    marginBottom: 10,
  },
  assetTotalLabel: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },
  assetTotalAmount: {
    color: "#05070A",
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
    marginBottom: 14,
  },
  assetBars: {
    gap: 8,
  },
  assetBarTrack: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
    backgroundColor: "#F3F4F6",
  },
  assetBarFill: {
    height: 8,
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  assetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  assetLabel: {
    flex: 1,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },
  assetPercentage: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
  },
  catRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  catLeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  catLabel: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  catTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  catAmount: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  catPercentBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#F3F4F6",
  },
  catPercentText: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  incomeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
  },
  incomeLabel: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    flex: 1,
  },
  incomeAmount: {
    color: "#1F8A4C",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  goalRow: {
    marginBottom: 12,
    gap: 6,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalLabel: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  goalPercentage: {
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
    backgroundColor: "#22C55E",
  },
  infraStatusText: {
    color: "#1F8A4C",
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
