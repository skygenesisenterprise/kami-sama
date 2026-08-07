import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, KeyboardAvoidingView, LayoutChangeEvent, Modal, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, RefreshControl, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextStyle, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { useTabScrollToTop } from "@/components/mobile/tab-scroll-to-top";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { usePortal } from "@/components/mobile/portal-provider";
import { getTransactionsForAccount, prependTransactionsForAccounts } from "@/data/account-transactions";
import { type HomeWidgetConfig, type HomeWidgetId, defaultHomeWidgets } from "@/data/home-widgets";
import { type Transaction, categoryConfig } from "@/data/transactions";
import { type Account, accounts } from "@/data/accounts";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

type QuickActionType = "add" | "betweenAccounts" | "qrPay" | "more";

const topUpMethods = [
  { title: "Recharger par virement SEPA", description: "Recevez de l'argent via vos coordonnées bancaires.", icon: "account-balance" as const, route: "/account-sepa" as const },
  { title: "Recevoir via Wero", description: "Paiement instantané européen.", icon: "send" as const, route: "/account-wero" as const },
  { title: "Depuis un compte SGE", description: "Déplacez des fonds depuis un espace autorisé.", icon: "business" as const, route: "/account-enterprise" as const },
  { title: "Depuis un coffre", description: "Retirez de l'argent depuis un Vault.", icon: "lock" as const, route: "/account-vault" as const },
  { title: "Générer des coordonnées bancaires", description: "Afficher IBAN, BIC et titulaire.", icon: "description" as const },
];

const moreOptions = [
  { title: "Relevés et documents", subtitle: "Consultez vos documents bancaires.", icon: "description" as const },
  { title: "Exporter les transactions", subtitle: "CSV, PDF ou JSON.", icon: "file-download" as const },
  { title: "Définir comme compte principal", subtitle: "Définir ce compte par défaut.", icon: "star" as const },
  { title: "Renommer le compte", subtitle: "Personnalisez le nom de ce compte.", icon: "edit" as const },
  { title: "Limites du compte", subtitle: "Consultez les plafonds et limites.", icon: "speed" as const },
  { title: "Notifications du compte", subtitle: "Gérez les alertes.", icon: "notifications" as const },
  { title: "Permissions financières", subtitle: "Gérez les accès liés à ce compte.", icon: "security" as const },
  { title: "Journal d'accès", subtitle: "Consultez les accès récents.", icon: "history" as const },
  { title: "Paramètres de confidentialité", subtitle: "Contrôlez vos données.", icon: "visibility" as const },
  { title: "Statut Ledger", subtitle: "Vérifiez la synchronisation du compte.", icon: "sync" as const },
  { title: "Support compte", subtitle: "Besoin d'aide ? Contactez le support.", icon: "support-agent" as const },
];

interface QuickAction {
  title: string;
  icon: IconName;
  action: QuickActionType;
}

interface BankCard {
  title: string;
  status: string;
  last4: string;
  icon: IconName;
  meta: string;
}

interface HomeWidgetDefinition {
  Component: React.ComponentType<HomeWidgetSectionProps>;
}

interface HomeWidgetSectionProps {
  activeAccount: Account;
}

const quickActions: QuickAction[] = [
  { title: "Ajouter de l'argent", icon: "add", action: "add" },
  { title: "Entre mes comptes", icon: "shuffle", action: "betweenAccounts" },
  { title: "QR Code", icon: "qr-code-scanner", action: "qrPay" },
  { title: "Plus", icon: "more-horiz", action: "more" },
];

interface Beneficiary {
  name: string;
  initials: string;
  accountHint: string;
}

interface CategorySpending {
  label: string;
  amount: string;
  percentage: number;
  icon: IconName;
}

interface ScheduledTransfer {
  title: string;
  date: string;
  amount: string;
  icon: IconName;
}

const scheduledTransfers: ScheduledTransfer[] = [
  { title: "Loyer", date: "28 juin 2026", amount: "-1 200,00 €", icon: "home" },
  { title: "Netflix", date: "15 juin 2026", amount: "-15,99 €", icon: "movie" },
  { title: "Assurance habitation", date: "18 juin 2026", amount: "-42,30 €", icon: "security" },
];

interface SavingGoal {
  title: string;
  current: number;
  target: number;
  icon: IconName;
}

const savingGoals: SavingGoal[] = [
  { title: "Vacances été", current: 1800, target: 3000, icon: "flight" },
  { title: "Fonds d'urgence", current: 4000, target: 6000, icon: "savings" },
];

interface RecentDocument {
  title: string;
  date: string;
  icon: IconName;
  meta: string;
}

interface MonthlySpendingPoint {
  day: string;
  amount: number;
}

interface AccountHomeContent {
  monthlySummary: {
    expenses: string;
    income: string;
    periodLabel: string;
  };
  monthlySpendingBars: number[];
  monthlySpendingChartData: MonthlySpendingPoint[];
  bankCards: BankCard[];
  frequentBeneficiaries: Beneficiary[];
  categorySpending: CategorySpending[];
  scheduledTransfers: ScheduledTransfer[];
  savingGoals: SavingGoal[];
  recentDocuments: RecentDocument[];
}

const accountHomeContent: Record<Account["id"], AccountHomeContent> = {
  "aether-salary": {
    monthlySummary: {
      expenses: "1 245 €",
      income: "8 500 €",
      periodLabel: "Cycle personnel",
    },
    monthlySpendingBars: [38, 62, 44, 78, 52, 34, 68],
    monthlySpendingChartData: [
      { day: "L", amount: 380 },
      { day: "M", amount: 620 },
      { day: "M", amount: 440 },
      { day: "J", amount: 780 },
      { day: "V", amount: 520 },
      { day: "S", amount: 340 },
      { day: "D", amount: 680 },
    ],
    bankCards: [
      { title: "Carte Virtuelle Aether Bank", status: "Active", last4: "4829", icon: "credit-card", meta: "Abonnements et e-commerce" },
      { title: "Carte Physique Aether Black", status: "Active", last4: "1094", icon: "style", meta: "Paiements quotidiens" },
    ],
    frequentBeneficiaries: [
      { name: "Sophie D.", initials: "SD", accountHint: "Compte joint" },
      { name: "Thomas M.", initials: "TM", accountHint: "Remboursements" },
      { name: "Aether Off.", initials: "AO", accountHint: "Virement interne" },
      { name: "SGE Europe", initials: "SE", accountHint: "Salaire" },
      { name: "Vault Infra", initials: "VI", accountHint: "Epargne" },
    ],
    categorySpending: [
      { label: "Alimentation", amount: "312 €", percentage: 38, icon: "restaurant" },
      { label: "Transport", amount: "187 €", percentage: 22, icon: "directions-car" },
      { label: "Abonnements", amount: "95 €", percentage: 15, icon: "subscriptions" },
      { label: "Loisirs", amount: "74 €", percentage: 12, icon: "sports-esports" },
      { label: "Autres", amount: "86 €", percentage: 13, icon: "more-horiz" },
    ],
    scheduledTransfers,
    savingGoals,
    recentDocuments: [
      { title: "Releve mai 2026", date: "2 juin 2026", icon: "description", meta: "Compte Personnel · PDF" },
      { title: "RIB - Personnel", date: "15 mai 2026", icon: "receipt", meta: "IBAN partageable" },
      { title: "Attestation de compte", date: "3 mai 2026", icon: "verified", meta: "Verification KYC" },
    ],
  },
  joint: {
    monthlySummary: {
      expenses: "2 890 €",
      income: "4 600 €",
      periodLabel: "Budget du foyer",
    },
    monthlySpendingBars: [46, 71, 52, 80, 64, 58, 49],
    monthlySpendingChartData: [
      { day: "L", amount: 520 },
      { day: "M", amount: 810 },
      { day: "M", amount: 640 },
      { day: "J", amount: 920 },
      { day: "V", amount: 760 },
      { day: "S", amount: 690 },
      { day: "D", amount: 540 },
    ],
    bankCards: [
      { title: "Carte commune Liam", status: "Active", last4: "6721", icon: "credit-card", meta: "Plafond mensuel 4 500 €" },
      { title: "Carte commune Sophie", status: "Active", last4: "1183", icon: "style", meta: "Apple Pay active" },
    ],
    frequentBeneficiaries: [
      { name: "Bailleur Paris", initials: "BP", accountHint: "Loyer" },
      { name: "EDF", initials: "ED", accountHint: "Energie" },
      { name: "Crèche Mila", initials: "CM", accountHint: "Famille" },
      { name: "Sophie D.", initials: "SD", accountHint: "Titulaire joint" },
    ],
    categorySpending: [
      { label: "Logement", amount: "1 242 €", percentage: 42, icon: "apartment" },
      { label: "Courses", amount: "618 €", percentage: 22, icon: "restaurant" },
      { label: "Factures", amount: "395 €", percentage: 14, icon: "receipt-long" },
      { label: "Transport", amount: "219 €", percentage: 12, icon: "directions-car" },
      { label: "Autres", amount: "416 €", percentage: 10, icon: "more-horiz" },
    ],
    scheduledTransfers: [
      { title: "Loyer", date: "28 juin 2026", amount: "-1 200,00 €", icon: "home" },
      { title: "Epargne foyer", date: "30 juin 2026", amount: "-400,00 €", icon: "savings" },
      { title: "Crèche", date: "5 juillet 2026", amount: "-520,00 €", icon: "child-care" },
    ],
    savingGoals: [
      { title: "Vacances famille", current: 3200, target: 5000, icon: "flight" },
      { title: "Travaux cuisine", current: 1800, target: 8000, icon: "construction" },
    ],
    recentDocuments: [
      { title: "Releve compte joint", date: "3 juin 2026", icon: "description", meta: "Compte Joint · PDF" },
      { title: "Mandat de prelevement", date: "28 mai 2026", icon: "assignment", meta: "Loyer principal" },
      { title: "Justificatif de domicile", date: "20 mai 2026", icon: "home-work", meta: "Titulaire joint" },
    ],
  },
  epargne: {
    monthlySummary: {
      expenses: "540 €",
      income: "2 200 €",
      periodLabel: "Allocation d'epargne",
    },
    monthlySpendingBars: [18, 12, 26, 20, 31, 22, 28],
    monthlySpendingChartData: [
      { day: "L", amount: 120 },
      { day: "M", amount: 85 },
      { day: "M", amount: 160 },
      { day: "J", amount: 110 },
      { day: "V", amount: 220 },
      { day: "S", amount: 150 },
      { day: "D", amount: 175 },
    ],
    bankCards: [],
    frequentBeneficiaries: [
      { name: "IBKR", initials: "IB", accountHint: "Investissement" },
      { name: "Vault Infra", initials: "VI", accountHint: "Coffre" },
      { name: "Compte Personnel", initials: "PE", accountHint: "Source reguliere" },
    ],
    categorySpending: [
      { label: "Investissement", amount: "500 €", percentage: 57, icon: "show-chart" },
      { label: "Frais de garde", amount: "120 €", percentage: 15, icon: "account-balance" },
      { label: "Fiscalite", amount: "84 €", percentage: 10, icon: "receipt-long" },
      { label: "Transferts", amount: "176 €", percentage: 18, icon: "swap-horiz" },
    ],
    scheduledTransfers: [
      { title: "Versement automatique", date: "1 juillet 2026", amount: "+500,00 €", icon: "calendar-month" },
      { title: "Depot portefeuille titres", date: "4 juillet 2026", amount: "-500,00 €", icon: "show-chart" },
    ],
    savingGoals: [
      { title: "Fonds d'urgence", current: 4000, target: 6000, icon: "health-and-safety" },
      { title: "Apport immobilier", current: 12200, target: 30000, icon: "apartment" },
    ],
    recentDocuments: [
      { title: "Releve d'epargne", date: "2 juin 2026", icon: "description", meta: "Rendement 2.5%" },
      { title: "Synthese performance", date: "31 mai 2026", icon: "insights", meta: "Performance mensuelle" },
    ],
  },
  "sge-operations": {
    monthlySummary: {
      expenses: "12 480 €",
      income: "34 900 €",
      periodLabel: "Operations SGE Belgium",
    },
    monthlySpendingBars: [54, 74, 62, 88, 71, 65, 81],
    monthlySpendingChartData: [
      { day: "L", amount: 2200 },
      { day: "M", amount: 3400 },
      { day: "M", amount: 2800 },
      { day: "J", amount: 4100 },
      { day: "V", amount: 3600 },
      { day: "S", amount: 2400 },
      { day: "D", amount: 2950 },
    ],
    bankCards: [
      { title: "Carte operationnelle SGE", status: "Active", last4: "5521", icon: "credit-card", meta: "Equipe operations · plafond 15 000 €" },
      { title: "Carte fournisseurs", status: "Sous surveillance", last4: "8842", icon: "admin-panel-settings", meta: "Validation renforcée active" },
    ],
    frequentBeneficiaries: [
      { name: "URSSAF", initials: "UR", accountHint: "Charges sociales" },
      { name: "AWS Europe", initials: "AW", accountHint: "Cloud" },
      { name: "WeWork", initials: "WW", accountHint: "Locaux" },
      { name: "Cabinet Legal", initials: "CL", accountHint: "Juridique" },
    ],
    categorySpending: [
      { label: "Prestations", amount: "8 920 €", percentage: 35, icon: "code" },
      { label: "Paie", amount: "6 820 €", percentage: 28, icon: "groups" },
      { label: "Infrastructure", amount: "2 460 €", percentage: 17, icon: "cloud" },
      { label: "Locaux", amount: "1 420 €", percentage: 11, icon: "business" },
      { label: "Autres", amount: "1 860 €", percentage: 9, icon: "more-horiz" },
    ],
    scheduledTransfers: [
      { title: "TVA reservee", date: "20 juin 2026", amount: "-2 150,00 €", icon: "receipt-long" },
      { title: "Prestataire finance", date: "24 juin 2026", amount: "-3 200,00 €", icon: "payments" },
      { title: "Dotation coffre", date: "30 juin 2026", amount: "-8 500,00 €", icon: "account-balance" },
    ],
    savingGoals: [
      { title: "Tresorerie 90 jours", current: 42100, target: 65000, icon: "shield" },
      { title: "Expansion produit", current: 11800, target: 25000, icon: "rocket-launch" },
    ],
    recentDocuments: [
      { title: "Releve pro juin", date: "14 juin 2026", icon: "description", meta: "SGE Belgium · PDF" },
      { title: "Export TVA", date: "13 juin 2026", icon: "table-chart", meta: "Preparation comptable" },
      { title: "Justificatif de virement AWS", date: "12 juin 2026", icon: "verified", meta: "Fournisseur critique" },
    ],
  },
};

function getAccountHomeContent(account: Account) {
  return accountHomeContent[account.id] ?? accountHomeContent["aether-salary"];
}

const homeWidgetRegistry: Record<HomeWidgetId, HomeWidgetDefinition> = {
  activity: { Component: ActivitySection },
  monthlySpending: { Component: MonthlySpendingSection },
  beneficiaries: { Component: FrequentBeneficiariesSection },
  cards: { Component: CardsSection },
  categorySpending: { Component: CategorySpendingSection },
  scheduledTransfers: { Component: ScheduledTransfersSection },
  savingGoals: { Component: SavingGoalsSection },
  recentDocuments: { Component: RecentDocumentsSection },
};

const HOME_HEADER_HEIGHT = 62;
const amountFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

function parseMoneyToMinor(value: string): number {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/,/g, "");
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function parseAmountInputToMinor(value: string): number {
  const normalized = value.replace(",", ".").replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function formatMinorToMoney(value: number): string {
  const formatted = amountFormatter.format(value / 100).replace(/\u202f/g, " ").replace(/\u00a0/g, " ");
  const numericValue = formatted.replace(/\s?€$/, "");

  return `€${numericValue}`;
}

function formatMinorToTransactionAmount(value: number, tone: Transaction["tone"]): string {
  const sign = tone === "credit" ? "+" : "-";
  const amount = Math.abs(value / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${sign}${amount} €`;
}

function accountIconFor(account: Account): IconName {
  if (account.type === "Épargne") {
    return "savings";
  }

  if (account.type === "Professionnel") {
    return "business";
  }

  if (account.type === "Joint") {
    return "group";
  }

  return "account-balance";
}

function AnimatedBalanceText({ value, style }: { value: string; style: StyleProp<TextStyle> }) {
  return (
    <Animated.Text key={value} entering={FadeIn.duration(260)} style={style}>
      {value}
    </Animated.Text>
  );
}

export default function HomeScreen() {
  const insets = usePhoneSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);
  const params = useLocalSearchParams<{ widgetOrder?: string; accountOrder?: string; updatedAt?: string }>();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [activeQuickAction, setActiveQuickAction] = React.useState<QuickActionType | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [homeWidgets, setHomeWidgets] = React.useState(defaultHomeWidgets);
  const [homeAccounts, setHomeAccounts] = React.useState(accounts);
  const portal = usePortal();
  const lastHandledUpdatedAtRef = React.useRef<string | null>(null);
  const homeAccountsRef = React.useRef(homeAccounts);

  React.useEffect(() => {
    homeAccountsRef.current = homeAccounts;
  }, [homeAccounts]);

  useTabScrollToTop("home", scrollRef);

  React.useEffect(() => {
    const widgetOrder = params.widgetOrder;
    const accountOrder = params.accountOrder;
    const updatedAt = params.updatedAt;

    if (typeof updatedAt !== "string" || lastHandledUpdatedAtRef.current === updatedAt) {
      return;
    }

    lastHandledUpdatedAtRef.current = updatedAt;

    if (typeof widgetOrder === "string") {
      const orderedWidgetIds = widgetOrder
        .split(",")
        .map((widgetId) => widgetId.trim())
        .filter((widgetId): widgetId is HomeWidgetId => defaultHomeWidgets.some((widget) => widget.id === widgetId));

      setHomeWidgets(() => {
        const orderedSet = new Set(orderedWidgetIds);
        const orderedWidgets = orderedWidgetIds.map((widgetId) => ({ id: widgetId, enabled: true }));
        const remainingWidgets = defaultHomeWidgets
          .filter((widget) => !orderedSet.has(widget.id))
          .map((widget) => ({ ...widget, enabled: false }));

        return [...orderedWidgets, ...remainingWidgets];
      });
    }

    if (typeof accountOrder === "string") {
      const orderedAccountIds = accountOrder
        .split(",")
        .map((accountId) => accountId.trim())
        .filter((accountId) => accounts.some((account) => account.id === accountId));

      setHomeAccounts(() => {
        const orderedSet = new Set(orderedAccountIds);
        const orderedAccounts = orderedAccountIds
          .map((accountId) => accounts.find((account) => account.id === accountId))
          .filter((account): account is Account => account !== undefined);
        const remainingAccounts = accounts.filter((account) => !orderedSet.has(account.id));

        return [...orderedAccounts, ...remainingAccounts];
      });
    }
  }, [params.accountOrder, params.updatedAt, params.widgetOrder]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);
  const activeAccount = homeAccounts[activeIndex] ?? homeAccounts[0];
  const activeAccountRef = React.useRef(activeAccount);

  React.useEffect(() => {
    activeAccountRef.current = activeAccount;
  }, [activeAccount]);

  const handleInternalTransfer = React.useCallback((sourceAccountId: string, destinationAccountId: string, amountMinor: number) => {
    const currentHomeAccounts = homeAccountsRef.current;
    const sourceAccount = currentHomeAccounts.find((currentAccount) => currentAccount.id === sourceAccountId);
    const destinationAccount = currentHomeAccounts.find((currentAccount) => currentAccount.id === destinationAccountId);
    const nowLabel = "À l'instant";

    if (sourceAccount && destinationAccount) {
      prependTransactionsForAccounts(
        sourceAccount.id,
        destinationAccount.id,
        {
          title: destinationAccount.label,
          description: `${nowLabel} · Transfert interne vers ${destinationAccount.label}`,
          amount: formatMinorToTransactionAmount(amountMinor, "debit"),
          tone: "debit",
          icon: "swap-horiz",
          category: "transfer",
        },
        {
          title: sourceAccount.label,
          description: `${nowLabel} · Transfert interne depuis ${sourceAccount.label}`,
          amount: formatMinorToTransactionAmount(amountMinor, "credit"),
          tone: "credit",
          icon: "swap-horiz",
          category: "transfer",
        }
      );
    }

    setHomeAccounts((currentAccounts) =>
      currentAccounts.map((currentAccount) => {
        const currentBalance = parseMoneyToMinor(currentAccount.balance);

        if (currentAccount.id === sourceAccountId) {
          return {
            ...currentAccount,
            balance: formatMinorToMoney(currentBalance - amountMinor),
            lastSync: "À l'instant",
          };
        }

        if (currentAccount.id === destinationAccountId) {
          return {
            ...currentAccount,
            balance: formatMinorToMoney(currentBalance + amountMinor),
            lastSync: "À l'instant",
          };
        }

        return currentAccount;
      })
    );
  }, []);

  const handleCloseQuickAction = React.useCallback(() => {
    setActiveQuickAction(null);
  }, []);

  React.useEffect(() => {
    const panelAccount = activeAccountRef.current;
    const panelAccounts = homeAccountsRef.current;

    switch (activeQuickAction) {
      case "add":
        portal.setPortalContent(<AddMoneyPanel account={panelAccount} onClose={handleCloseQuickAction} />);
        break;
      case "betweenAccounts":
        portal.setPortalContent(
          <BetweenAccountsPanel
            account={panelAccount}
            accounts={panelAccounts}
            onClose={handleCloseQuickAction}
            onTransfer={handleInternalTransfer}
          />
        );
        break;
      case "more":
        portal.setPortalContent(<MoreOptionsPanel account={panelAccount} onClose={handleCloseQuickAction} />);
        break;
      default:
        portal.setPortalContent(null);
    }
  }, [activeQuickAction, portal, handleCloseQuickAction, activeAccount.id, handleInternalTransfer]);

  return (
    <ScreenTransition>
      <View style={styles.safeArea}>
        <View style={[styles.fixedHeader, { paddingTop: insets.top + 6 }]}>
          <HomeHeader />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 6 + HOME_HEADER_HEIGHT }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B7280" colors={["#6B7280"]} />}
        >
          <HeroSection
            activeIndex={activeIndex}
            onIndexChange={setActiveIndex}
            accounts={homeAccounts}
            activeWidgetIds={homeWidgets.filter((widget) => widget.enabled).map((widget) => widget.id)}
          />

          <View style={styles.quickActionRow}>
            {quickActions.map((action) => (
              <QuickActionButton
                key={action.title}
                action={action}
                onPress={() => {
                  if (action.action === "qrPay") {
                    router.push({
                      pathname: "/qr-scan",
                      params: {
                        accountId: activeAccount.id,
                      },
                    });
                    return;
                  }

                  setActiveQuickAction(action.action);
                }}
              />
            ))}
          </View>

          {homeWidgets
            .filter((widget) => widget.enabled)
            .map((widget) => {
              const widgetDefinition = homeWidgetRegistry[widget.id];
              return (
                <View key={widget.id} style={styles.widgetSlot}>
                  <widgetDefinition.Component activeAccount={activeAccount} />
                </View>
              );
            })}

          <AddWidgetButton homeWidgets={homeWidgets} />
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function HeroSection({
  activeIndex,
  onIndexChange,
  accounts,
  activeWidgetIds,
}: {
  activeIndex: number;
  onIndexChange: (index: number) => void;
  accounts: Account[];
  activeWidgetIds: HomeWidgetId[];
}) {
  const [cardWidth, setCardWidth] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);

  const handleLayout = (e: LayoutChangeEvent) => {
    setCardWidth(e.nativeEvent.layout.width);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = cardWidth > 0 ? Math.round(e.nativeEvent.contentOffset.x / cardWidth) : 0;
    onIndexChange(index);
  };

  return (
    <View style={styles.heroSection} onLayout={handleLayout}>
      {cardWidth > 0 && (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth}
            snapToAlignment="start"
            onMomentumScrollEnd={handleScroll}
            style={styles.heroScroll}
          >
            {accounts.map((account) => (
              <Pressable
                key={account.id}
                style={[styles.heroAccountContent, { width: cardWidth }]}
                onPress={() => router.push(`/account-detail?id=${encodeURIComponent(account.id)}`)}
              >
                <Text style={styles.heroAccountType}>{account.label}</Text>
                <AnimatedBalanceText value={account.balance} style={styles.heroAccountAmount} />
                <Text style={styles.heroAccountMeta}>{account.meta}</Text>
                <Pressable
                  style={styles.walletButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    router.push({
                      pathname: "/account-settings",
                      params: {
                        accountOrder: accounts.map((currentAccount) => currentAccount.id).join(","),
                        widgetOrder: activeWidgetIds.join(","),
                      },
                    });
                  }}
                >
                  <Text style={styles.walletButtonText}>Comptes et Portefeuilles</Text>
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.accountPageDots}>
            {accounts.map((_, i) => (
              <View key={i} style={[styles.accountPageDot, i === activeIndex && styles.accountPageDotActive]} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function HomeHeader() {
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

        <Pressable style={styles.headerUtilityButton} onPress={() => router.push("/cards")}>
          <MaterialIcons name="credit-card" size={21} color="#111827" />
          <Text style={styles.headerUtilityLabel}>Cartes</Text>
        </Pressable>
      </View>
    </View>
  );
}


function QuickActionButton({ action, onPress }: { action: QuickAction; onPress: () => void }) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <MaterialIcons name={action.icon} size={20} color="#111827" />
      </View>
      <Text style={styles.quickActionText}>{action.title}</Text>
    </Pressable>
  );
}

function TransactionRow({
  accountId,
  transaction,
  transactionIndex,
}: {
  accountId?: string;
  transaction: Transaction;
  transactionIndex?: number;
}) {
  const cat = categoryConfig[transaction.category];
  return (
    <Pressable
      style={styles.transactionRow}
      onPress={() =>
        router.push({
          pathname: "/transaction-detail",
          params: {
            title: transaction.title,
            accountId,
            transactionIndex: transactionIndex !== undefined ? String(transactionIndex) : undefined,
          },
        })
      }
    >
      <View style={[styles.transactionIcon, { backgroundColor: cat.bgColor }]}>
        <MaterialIcons name={transaction.icon} size={20} color={cat.color} />
      </View>
      <View style={styles.transactionCopy}>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, transaction.tone === "credit" ? styles.creditAmount : styles.debitAmount]}>
          {transaction.amount}
        </Text>
        <Text style={styles.transactionCategory}>{cat.label}</Text>
      </View>
    </Pressable>
  );
}

function ActivitySection({ activeAccount }: HomeWidgetSectionProps) {
  const accountTransactions = getTransactionsForAccount(activeAccount.id);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>Activite recente</Text>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/transactions",
              params: {
                accountId: activeAccount.id,
              },
            })
          }
        >
          <Text style={styles.postAction}>Voir tout</Text>
        </Pressable>
      </View>
      {accountTransactions.slice(0, 4).map((transaction, index) => (
        <TransactionRow
          key={`${transaction.title}-${transaction.amount}`}
          accountId={activeAccount.id}
          transaction={transaction}
          transactionIndex={index}
        />
      ))}
    </View>
  );
}

function MonthlySpendingSection({ activeAccount }: HomeWidgetSectionProps) {
  const homeContent = getAccountHomeContent(activeAccount);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>Depenses du mois</Text>
      </View>
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartLabel}>Depenses</Text>
            <Text style={styles.chartValue}>{homeContent.monthlySummary.expenses}</Text>
          </View>
          <View style={styles.chartIncomeBlock}>
            <Text style={styles.chartLabel}>Revenus</Text>
            <Text style={styles.chartIncomeValue}>{homeContent.monthlySummary.income}</Text>
          </View>
        </View>
        <Text style={styles.chartPeriodLabel}>{homeContent.monthlySummary.periodLabel}</Text>

        {Platform.OS === "web" ? (
          <MonthlySpendingRechart data={homeContent.monthlySpendingChartData} />
        ) : (
          <MonthlySpendingNativeChart bars={homeContent.monthlySpendingBars} />
        )}
      </View>
    </View>
  );
}

function MonthlySpendingRechart({ data }: { data: MonthlySpendingPoint[] }) {
  const [chartWidth, setChartWidth] = React.useState(0);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    setChartWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
  }, []);

  return (
    <View onLayout={handleLayout} style={styles.webChart}>
      {chartWidth > 0 ? (
        <ResponsiveContainer width={chartWidth} height="100%">
          <BarChart data={data} margin={{ bottom: 0, left: 0, right: 0, top: 10 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 700 }}
            />
            <Bar dataKey="amount" fill="#111827" radius={[999, 999, 999, 999]} />
          </BarChart>
        </ResponsiveContainer>
      ) : null}
    </View>
  );
}

function MonthlySpendingNativeChart({ bars }: { bars: number[] }) {
  return (
    <View style={styles.barChart}>
      {bars.map((height, index) => (
        <View key={`${height}-${index}`} style={styles.barColumn}>
          <View style={[styles.barFill, { height }]} />
        </View>
      ))}
    </View>
  );
}

function CardsSection({ activeAccount }: HomeWidgetSectionProps) {
  const homeContent = getAccountHomeContent(activeAccount);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>Mes cartes</Text>
        <Pressable onPress={() => router.push("/cards")}>
          <Text style={styles.postAction}>Voir tout</Text>
        </Pressable>
      </View>
      {homeContent.bankCards.length > 0 ? (
        homeContent.bankCards.map((card) => (
          <CardRow key={card.last4} card={card} />
        ))
      ) : (
        <SectionPlaceholder
          icon="credit-card-off"
          title="Aucune carte rattachee"
          description="Ce compte est principalement alimente par virements internes et ne dispose pas de carte active."
        />
      )}
    </View>
  );
}

function CardRow({ card }: { card: BankCard }) {
  return (
    <Pressable style={styles.cardRow}>
      <View style={styles.transactionIcon}>
        <MaterialIcons name={card.icon} size={20} color="#111827" />
      </View>
      <View style={styles.transactionCopy}>
        <Text style={styles.transactionTitle}>{card.title}</Text>
        <Text style={styles.transactionDescription}>{card.status} · {card.meta}</Text>
      </View>
      <Text style={styles.cardLast4}>**** {card.last4}</Text>
    </Pressable>
  );
}

function FrequentBeneficiariesSection({ activeAccount }: HomeWidgetSectionProps) {
  const homeContent = getAccountHomeContent(activeAccount);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>Beneficiaires frequents</Text>
        <Pressable onPress={() => router.push("/transferts")}>
          <Text style={styles.postAction}>Gerer</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.beneficiaryScroll}>
        {homeContent.frequentBeneficiaries.map((b) => (
          <Pressable key={b.name} style={styles.beneficiaryItem}>
            <View style={styles.beneficiaryAvatar}>
              <Text style={styles.beneficiaryInitials}>{b.initials}</Text>
            </View>
            <Text style={styles.beneficiaryName}>{b.name}</Text>
            <Text style={styles.beneficiaryHint}>{b.accountHint}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function CategorySpendingSection({ activeAccount }: HomeWidgetSectionProps) {
  const homeContent = getAccountHomeContent(activeAccount);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>Depenses par categorie</Text>
      </View>
      {homeContent.categorySpending.map((cat) => (
        <View key={cat.label} style={styles.categoryRow}>
          <View style={styles.categoryIcon}>
            <MaterialIcons name={cat.icon} size={16} color="#111827" />
          </View>
          <View style={styles.categoryCopy}>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
            <View style={styles.categoryBar}>
              <View style={[styles.categoryBarFill, { width: `${cat.percentage}%` }]} />
            </View>
          </View>
          <Text style={styles.categoryAmount}>{cat.amount}</Text>
        </View>
      ))}
    </View>
  );
}

function ScheduledTransfersSection({ activeAccount }: HomeWidgetSectionProps) {
  const homeContent = getAccountHomeContent(activeAccount);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>Virements programmes</Text>
        <Pressable onPress={() => router.push("/transferts")}>
          <Text style={styles.postAction}>Voir tout</Text>
        </Pressable>
      </View>
      {homeContent.scheduledTransfers.length > 0 ? (
        homeContent.scheduledTransfers.map((t) => (
          <View key={t.title} style={styles.categoryRow}>
            <View style={styles.categoryIcon}>
              <MaterialIcons name={t.icon} size={16} color="#111827" />
            </View>
            <View style={styles.categoryCopy}>
              <Text style={styles.categoryLabel}>{t.title}</Text>
              <Text style={styles.transferDate}>{t.date}</Text>
            </View>
            <Text style={styles.debitAmount}>{t.amount}</Text>
          </View>
        ))
      ) : (
        <SectionPlaceholder
          icon="event-busy"
          title="Aucun virement programme"
          description="Aucune instruction recurrente n'est definie pour ce compte."
        />
      )}
    </View>
  );
}

function SavingGoalsSection({ activeAccount }: HomeWidgetSectionProps) {
  const homeContent = getAccountHomeContent(activeAccount);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>Objectifs d'epargne</Text>
        <Pressable onPress={() => router.push("/account")}>
          <Text style={styles.postAction}>Ajouter</Text>
        </Pressable>
      </View>
      {homeContent.savingGoals.map((goal) => {
        const progress = Math.round((goal.current / goal.target) * 100);
        return (
          <View key={goal.title} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.categoryIcon}>
                <MaterialIcons name={goal.icon} size={16} color="#111827" />
              </View>
              <View style={styles.categoryCopy}>
                <Text style={styles.categoryLabel}>{goal.title}</Text>
                <Text style={styles.goalMeta}>
                  {goal.current.toLocaleString("fr-FR")} € / {goal.target.toLocaleString("fr-FR")} €
                </Text>
              </View>
              <Text style={styles.goalPercentage}>{progress}%</Text>
            </View>
            <View style={styles.goalBar}>
              <View style={[styles.goalBarFill, { width: `${progress}%` }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function RecentDocumentsSection({ activeAccount }: HomeWidgetSectionProps) {
  const homeContent = getAccountHomeContent(activeAccount);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>Documents recents</Text>
        <Pressable onPress={() => router.push("/account")}>
          <Text style={styles.postAction}>Voir tout</Text>
        </Pressable>
      </View>
      {homeContent.recentDocuments.map((doc) => (
        <Pressable key={doc.title} style={styles.categoryRow}>
          <View style={styles.categoryIcon}>
            <MaterialIcons name={doc.icon} size={16} color="#111827" />
          </View>
          <View style={styles.categoryCopy}>
            <Text style={styles.categoryLabel}>{doc.title}</Text>
            <Text style={styles.transferDate}>{doc.date} · {doc.meta}</Text>
          </View>
          <MaterialIcons name="file-download" size={18} color="#6B7280" />
        </Pressable>
      ))}
    </View>
  );
}

function SectionPlaceholder({
  description,
  icon,
  title,
}: {
  description: string;
  icon: IconName;
  title: string;
}) {
  return (
    <View style={styles.sectionPlaceholder}>
      <View style={styles.sectionPlaceholderIcon}>
        <MaterialIcons name={icon} size={18} color="#6B7280" />
      </View>
      <View style={styles.sectionPlaceholderCopy}>
        <Text style={styles.sectionPlaceholderTitle}>{title}</Text>
        <Text style={styles.sectionPlaceholderText}>{description}</Text>
      </View>
    </View>
  );
}

function AddWidgetButton({ homeWidgets }: { homeWidgets: HomeWidgetConfig[] }) {
  return (
    <Pressable
      style={styles.addWidgetButton}
      onPress={() =>
        router.push({
          pathname: "/widget-create",
          params: {
            activeWidgets: homeWidgets.filter((widget) => widget.enabled).map((widget) => widget.id).join(","),
          },
        })
      }
    >
      <MaterialIcons name="add-circle-outline" size={18} color="#111827" />
      <Text style={styles.addWidgetButtonText}>Organiser les widgets</Text>
    </Pressable>
  );
}

function BottomSheet({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const sheetBody = (
    <>
      <View style={styles.bottomSheetHandle} />
      <View style={styles.bottomSheetHeader}>
        <Text style={styles.bottomSheetTitle}>{title}</Text>
        <Pressable onPress={handleClose} style={styles.bottomSheetCloseButton}>
          <MaterialIcons name="close" size={22} color="#6B7280" />
        </Pressable>
      </View>
      <ScrollView
        style={styles.bottomSheetScroll}
        contentContainerStyle={styles.bottomSheetScrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </>
  );

  if (Platform.OS === "web") {
    return (
      <Animated.View entering={FadeIn.duration(200)} style={styles.bottomSheetOverlayWeb} pointerEvents="box-none">
        <Pressable style={styles.bottomSheetBackdropWeb} onPress={handleClose} />
        <KeyboardAvoidingView style={styles.bottomSheetKeyboardView}>
          <View style={[styles.bottomSheetContainer, styles.bottomSheetContainerWeb]}>
            {sheetBody}
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    );
  }

  const sheetContent = (
    <Animated.View entering={FadeIn.duration(200)} style={styles.bottomSheetOverlay} pointerEvents="box-none">
      <Pressable style={styles.bottomSheetBackdrop} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 18 : 0}
        style={styles.bottomSheetKeyboardView}
      >
        <View style={styles.bottomSheetContainer}>
          {sheetBody}
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={handleClose}>
      {sheetContent}
    </Modal>
  );
}

function AddMoneyPanel({ account, onClose }: { account: Account; onClose: () => void }) {
  const [showIBAN, setShowIBAN] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <BottomSheet onClose={onClose} title="Ajouter de l'argent">
      <Text style={styles.bottomSheetSubtitle}>Alimentez votre compte {account.label}</Text>

      <View style={styles.bottomSheetSection}>
        {topUpMethods.map((method) => (
          <Pressable
            key={method.title}
            style={styles.methodRow}
            onPress={() => {
              if (method.route) {
                router.push(method.route);
                onClose();
              } else if (method.title === "Générer des coordonnées bancaires") {
                setShowIBAN((prev) => !prev);
              }
            }}
          >
            <View style={styles.methodIcon}>
              <MaterialIcons name={method.icon} size={20} color="#111827" />
            </View>
            <View style={styles.methodCopy}>
              <Text style={styles.methodTitle}>{method.title}</Text>
              <Text style={styles.methodDescription}>{method.description}</Text>
            </View>
            {method.title === "Générer des coordonnées bancaires" && (
              <MaterialIcons name={showIBAN ? "expand-less" : "expand-more"} size={20} color="#6B7280" />
            )}
          </Pressable>
        ))}
      </View>

      {showIBAN && (
        <View style={styles.ibanCard}>
          <Text style={styles.ibanCardTitle}>Coordonnées bancaires</Text>
          <View style={styles.ibanRow}>
            <Text style={styles.ibanLabel}>Titulaire</Text>
            <Text style={styles.ibanValue}>{account.holder}</Text>
          </View>
          <View style={styles.ibanRow}>
            <Text style={styles.ibanLabel}>IBAN</Text>
            <Text style={styles.ibanValue}>{account.iban}</Text>
          </View>
          <View style={styles.ibanRow}>
            <Text style={styles.ibanLabel}>BIC</Text>
            <Text style={styles.ibanValue}>{account.bic}</Text>
          </View>
          <View style={styles.ibanActions}>
            <Pressable style={styles.ibanButton} onPress={handleCopy}>
              <MaterialIcons name="content-copy" size={16} color="#111827" />
              <Text style={styles.ibanButtonText}>{copied ? "Copié !" : "Copier l'IBAN"}</Text>
            </Pressable>
            <Pressable style={styles.ibanButton}>
              <MaterialIcons name="share" size={16} color="#111827" />
              <Text style={styles.ibanButtonText}>Partager</Text>
            </Pressable>
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

function BetweenAccountsPanel({
  account,
  accounts,
  onClose,
  onTransfer,
}: {
  account: Account;
  accounts: Account[];
  onClose: () => void;
  onTransfer: (sourceAccountId: string, destinationAccountId: string, amountMinor: number) => void;
}) {
  const [selectedDest, setSelectedDest] = React.useState(0);
  const [amount, setAmount] = React.useState("");
  const [transferSuccess, setTransferSuccess] = React.useState(false);
  const [confirmedDestinationLabel, setConfirmedDestinationLabel] = React.useState("");
  const hasAmount = amount.trim().length > 0;

  const contextualDestinations = React.useMemo(
    () => accounts.filter((currentAccount) => currentAccount.id !== account.id),
    [account.id, accounts]
  );

  React.useEffect(() => {
    if (selectedDest >= contextualDestinations.length) {
      setSelectedDest(0);
    }
  }, [contextualDestinations.length, selectedDest]);

  const handleTransfer = React.useCallback(() => {
    const destination = contextualDestinations[selectedDest];
    const amountMinor = parseAmountInputToMinor(amount);
    const sourceBalanceMinor = parseMoneyToMinor(account.balance);

    if (!destination) {
      Alert.alert("Transfert indisponible", "Aucun autre compte n'est disponible pour ce transfert.");
      return;
    }

    if (amountMinor <= 0) {
      Alert.alert("Montant invalide", "Saisissez un montant supérieur à 0 €.");
      return;
    }

    if (amountMinor > sourceBalanceMinor) {
      Alert.alert("Solde insuffisant", `Le solde disponible sur ${account.label} est de ${account.balance}.`);
      return;
    }

    onTransfer(account.id, destination.id, amountMinor);
    setConfirmedDestinationLabel(destination.label);
    setTransferSuccess(true);
  }, [account.balance, account.id, account.label, amount, contextualDestinations, onTransfer, selectedDest]);

  if (transferSuccess) {
    return (
      <BottomSheet onClose={onClose} title="Entre mes comptes">
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={48} color="#1F8A4C" />
          </View>
          <Text style={styles.successTitle}>Transfert simulé avec succès</Text>
          <Text style={styles.successDescription}>
            {formatMinorToMoney(parseAmountInputToMinor(amount))} ont été transférés vers {confirmedDestinationLabel}.
          </Text>
          <Text style={styles.successLedgerNote}>
            Les soldes des comptes concernés ont été mis à jour automatiquement.
          </Text>
          <Pressable style={styles.successButton} onPress={onClose}>
            <Text style={styles.successButtonText}>Fermer</Text>
          </Pressable>
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet onClose={onClose} title={`Depuis ${account.type}`}>
      <Text style={styles.bottomSheetSubtitle}>
        Transférez depuis votre compte {account.type} vers un autre espace Aether Bank.
      </Text>

      <View style={styles.transferSection}>
        <Text style={styles.transferLabel}>Compte source</Text>
        <View style={styles.sourceAccountCard}>
          <View style={styles.sourceAccountIcon}>
            <MaterialIcons name={accountIconFor(account)} size={20} color="#111827" />
          </View>
          <View style={styles.sourceAccountCopy}>
            <Text style={styles.sourceAccountLabel}>{account.label}</Text>
            <View style={styles.balanceLine}>
              <AnimatedBalanceText value={account.balance} style={styles.sourceAccountBalanceValue} />
              <Text style={styles.sourceAccountBalance}> disponible</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.transferSection}>
        <Text style={styles.transferLabel}>Compte destination</Text>
        {contextualDestinations.length === 0 ? (
          <View style={styles.emptyDestAccountCard}>
            <MaterialIcons name="info-outline" size={18} color="#6B7280" />
            <Text style={styles.emptyDestAccountText}>Aucun autre compte Aether disponible.</Text>
          </View>
        ) : contextualDestinations.map((dest, index) => (
          <Pressable
            key={dest.id}
            style={[styles.destAccountCard, selectedDest === index && styles.destAccountCardSelected]}
            onPress={() => setSelectedDest(index)}
          >
            <View style={styles.destAccountIcon}>
              <MaterialIcons name={accountIconFor(dest)} size={18} color="#111827" />
            </View>
            <View style={styles.destAccountCopy}>
              <Text style={styles.destAccountLabel}>{dest.label}</Text>
              <View style={styles.balanceLine}>
                <AnimatedBalanceText value={dest.balance} style={styles.destAccountBalanceValue} />
                <Text style={styles.destAccountMeta}> · {dest.meta}</Text>
              </View>
            </View>
            {selectedDest === index && (
              <MaterialIcons name="check-circle" size={20} color="#1F8A4C" />
            )}
          </Pressable>
        ))}
      </View>

      <View style={styles.transferSection}>
        <Text style={styles.transferLabel}>Montant</Text>
        <View style={styles.amountInputRow}>
          {hasAmount && <Text style={styles.amountCurrency}>€</Text>}
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            inputMode="decimal"
            selectTextOnFocus
            placeholder=""
            placeholderTextColor="#6B7280"
          />
        </View>
      </View>

      <Pressable style={styles.transferButton} onPress={handleTransfer}>
        <Text style={styles.transferButtonText}>Transférer</Text>
      </Pressable>

      <View style={styles.transferInfoCard}>
        <MaterialIcons name="info-outline" size={16} color="#6B7280" />
        <Text style={styles.transferInfoText}>
          Ce transfert utilise uniquement les comptes chargés sur votre accueil. Les soldes source et destination se synchronisent immédiatement dans cette session.
        </Text>
      </View>
    </BottomSheet>
  );
}

function AccountInfoPanel({ account, onClose }: { account: Account; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <BottomSheet onClose={onClose} title="Informations du compte">
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Compte</Text>
          <Text style={styles.infoValue}>{account.label}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Solde disponible</Text>
          <Text style={styles.infoValueBold}>{account.balance}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Devise</Text>
          <Text style={styles.infoValue}>{account.currency}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Statut</Text>
          <View style={styles.infoStatusBadge}>
            <Text style={styles.infoStatusText}>{account.status}</Text>
          </View>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Région</Text>
          <Text style={styles.infoValue}>{account.region}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Titulaire</Text>
          <Text style={styles.infoValue}>{account.holder}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>IBAN</Text>
          <Text style={styles.infoValue}>{account.iban}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>BIC</Text>
          <Text style={styles.infoValue}>{account.bic}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ledger Account ID</Text>
          <Text style={styles.infoValueMono}>{account.ledgerAccountId}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dernière synchronisation</Text>
          <Text style={styles.infoValue}>{account.lastSync}</Text>
        </View>
      </View>

      <View style={styles.infoActions}>
        <Pressable style={styles.infoActionButton} onPress={handleCopy}>
          <MaterialIcons name="content-copy" size={16} color="#111827" />
          <Text style={styles.infoActionText}>{copied ? "Copié !" : "Copier l'IBAN"}</Text>
        </Pressable>
        <Pressable style={styles.infoActionButton}>
          <MaterialIcons name="share" size={16} color="#111827" />
          <Text style={styles.infoActionText}>Partager les coordonnées</Text>
        </Pressable>
        <Pressable style={styles.infoActionButton}>
          <MaterialIcons name="file-download" size={16} color="#111827" />
          <Text style={styles.infoActionText}>Télécharger un RIB</Text>
        </Pressable>
      </View>

      <View style={styles.infoLedgerNote}>
        <MaterialIcons name="info-outline" size={14} color="#6B7280" />
        <Text style={styles.infoLedgerText}>
          Aether Ledger est la source de vérité de ce compte.
        </Text>
      </View>

      <View style={styles.bottomSheetFooter}>
        <Text style={styles.bottomSheetFooterText}>
          TODO: Connect account details endpoint. Connect Aether Ledger account metadata. Connect statement / RIB generation. Connect native share.
        </Text>
      </View>
    </BottomSheet>
  );
}

function MoreOptionsPanel({ account, onClose }: { account: Account; onClose: () => void }) {
  const handleOptionPress = React.useCallback(
    (title: string) => {
      Alert.alert(title, "Action simulée — disponible en développement.", [{ text: "OK" }]);
    },
    [],
  );

  return (
    <BottomSheet onClose={onClose} title="Plus d'options">
      <View style={styles.optionsSection}>
        {moreOptions.map((option) => (
          <Pressable key={option.title} style={styles.optionRow} onPress={() => handleOptionPress(option.title)}>
            <View style={styles.optionIcon}>
              <MaterialIcons name={option.icon} size={20} color="#111827" />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 116,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    zIndex: 30,
    elevation: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#F5F7FA",
  },
  heroSection: {
    minHeight: 284,
    borderRadius: 32,
    paddingBottom: 20,
    marginBottom: 0,
    backgroundColor: "transparent",
  },
  headerBlock: {
    marginBottom: 0,
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
  heroScroll: {
    height: 248,
  },
  heroAccountContent: {
    height: 248,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  heroAccountType: {
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  heroAccountAmount: {
    color: "#05070A",
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroAccountMeta: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: 4,
  },
  walletButton: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 22,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#111827",
  },
  walletButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  accountPageDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 14,
    marginBottom: 8,
  },
  accountPageDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  accountPageDotActive: {
    width: 18,
    backgroundColor: "#111827",
  },
  quickActionRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: -14,
    marginBottom: 18,
    zIndex: 2,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    minWidth: 0,
    paddingHorizontal: 2,
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
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    flexShrink: 1,
  },
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  identityIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  identityCopy: {
    flex: 1,
  },
  identityTitle: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  identityText: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 1,
  },
  configureButton: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: "#111827",
  },
  configureText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  widgetSlot: {
    marginBottom: 6,
  },
  postCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  postTitle: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  postAction: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  accountContextRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 6,
  },
  accountContextBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
  },
  accountContextText: {
    color: "#111827",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  accountContextMeta: {
    flex: 1,
    color: "#6B7280",
    textAlign: "right",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  transactionIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  transactionCopy: {
    flex: 1,
  },
  transactionTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  transactionDescription: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 1,
  },
  transactionAmount: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  creditAmount: {
    color: "#1F8A4C",
  },
  debitAmount: {
    color: "#111827",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionCategory: {
    color: "#9CA3AF",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  chartCard: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 5,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  chartLabel: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  chartPeriodLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 6,
  },
  chartValue: {
    color: "#05070A",
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "900",
    marginTop: 3,
  },
  chartIncomeBlock: {
    alignItems: "flex-end",
  },
  chartIncomeValue: {
    color: "#111827",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    marginTop: 3,
  },
  barChart: {
    height: 96,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 16,
  },
  barColumn: {
    flex: 1,
    height: 96,
    justifyContent: "flex-end",
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  barFill: {
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  webChart: {
    minWidth: 0,
    height: 116,
    marginTop: 12,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cardLast4: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  securityContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  promoSection: {
    marginBottom: 14,
  },
  promoSectionTitle: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    marginBottom: 12,
  },
  promoCarousel: {
    overflow: "hidden",
  },
  promoCard: {
    height: 150,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 18,
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  promoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  promoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  promoTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  promoDescription: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  promoButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#111827",
  },
  promoButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
  },
  promoDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },
  promoDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  promoDotActive: {
    width: 18,
    backgroundColor: "#111827",
  },
  addWidgetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 54,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
  },
  addWidgetButtonText: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },

  // Beneficiaries
  beneficiaryScroll: {
    marginTop: 4,
  },
  beneficiaryItem: {
    alignItems: "center",
    marginRight: 20,
    width: 64,
  },
  beneficiaryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 6,
  },
  beneficiaryInitials: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  beneficiaryName: {
    color: "#374151",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  beneficiaryHint: {
    color: "#9CA3AF",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 3,
  },

  // Category Spending / Scheduled Transfers shared row
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  categoryIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  categoryCopy: {
    flex: 1,
  },
  categoryLabel: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  categoryAmount: {
    color: "#05070A",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  categoryBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F3F4F6",
    marginTop: 6,
    overflow: "hidden",
  },
  categoryBarFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#111827",
  },
  transferDate: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 1,
  },
  sectionPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 14,
    marginTop: 8,
  },
  sectionPlaceholderIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  sectionPlaceholderCopy: {
    flex: 1,
  },
  sectionPlaceholderTitle: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  sectionPlaceholderText: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },

  // Saving Goals
  goalCard: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  goalMeta: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 1,
  },
  goalPercentage: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  goalBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F3F4F6",
    marginTop: 10,
    overflow: "hidden",
  },
  goalBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1F8A4C",
  },

  // Bottom Sheet
  bottomSheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 1000,
    elevation: 1000,
  },
  bottomSheetOverlayWeb: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 1000,
    elevation: 1000,
  },
  bottomSheetBackdrop: {
    flex: 1,
  },
  bottomSheetBackdropWeb: {
    flex: 1,
  },
  bottomSheetKeyboardView: {
    flex: 2,
    width: "100%",
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 14,
  },
  bottomSheetContainerWeb: {
    height: "50%",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    paddingTop: 16,
    paddingBottom: 20,
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 16,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bottomSheetTitle: {
    color: "#05070A",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
  },
  bottomSheetCloseButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
  },
  bottomSheetScroll: {
    flex: 1,
  },
  bottomSheetScrollContent: {
    paddingBottom: 24,
  },
  bottomSheetSubtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
    marginBottom: 20,
    marginTop: 4,
  },
  bottomSheetSection: {
    marginBottom: 8,
  },
  bottomSheetFooter: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginBottom: 8,
  },
  bottomSheetFooterText: {
    color: "#9CA3AF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },

  // Add Money Panel
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  methodIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  methodCopy: {
    flex: 1,
  },
  methodTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  methodDescription: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  ibanCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    backgroundColor: "#F9FAFB",
  },
  ibanCardTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    marginBottom: 14,
  },
  ibanRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  ibanLabel: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  ibanValue: {
    color: "#05070A",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "right",
  },
  ibanActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  ibanButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  ibanButtonText: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },

  // Between Accounts Panel
  transferSection: {
    marginBottom: 18,
  },
  transferLabel: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sourceAccountCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#F9FAFB",
  },
  sourceAccountIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  sourceAccountCopy: {
    flex: 1,
  },
  balanceLine: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 2,
  },
  sourceAccountLabel: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  sourceAccountBalanceValue: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  sourceAccountBalance: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  destAccountCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  destAccountCardSelected: {
    borderColor: "#111827",
    backgroundColor: "#F9FAFB",
  },
  destAccountIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  destAccountCopy: {
    flex: 1,
  },
  destAccountLabel: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  destAccountMeta: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  destAccountBalanceValue: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  emptyDestAccountCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 13,
    backgroundColor: "#F9FAFB",
  },
  emptyDestAccountText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  amountCurrency: {
    color: "#05070A",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  amountInput: {
    flex: 1,
    minWidth: 0,
    color: "#05070A",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    padding: 0,
    textAlign: "left",
  },
  transferButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    marginBottom: 14,
  },
  transferButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  transferInfoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#F9FAFB",
  },
  transferInfoText: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    flex: 1,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 8,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    color: "#1F8A4C",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  successDescription: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  successLedgerNote: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 24,
  },
  successButton: {
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#111827",
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },

  // Account Info Panel
  infoCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  infoValue: {
    color: "#05070A",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    textAlign: "right",
    maxWidth: "60%",
  },
  infoValueBold: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    textAlign: "right",
  },
  infoValueMono: {
    color: "#05070A",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
    textAlign: "right",
    maxWidth: "60%",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  infoStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#DCFCE7",
  },
  infoStatusText: {
    color: "#166534",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  infoActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  infoActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  infoActionText: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  infoLedgerNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  infoLedgerText: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    flex: 1,
  },

  // More Options Panel
  optionsSection: {
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  optionIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  optionSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
});
