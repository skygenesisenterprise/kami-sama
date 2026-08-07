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

interface TransferRail {
  name: string;
  description: string;
  icon: IconName;
}

interface AccountSpace {
  name: string;
  balance: string;
  icon: IconName;
}

interface Beneficiary {
  initials: string;
  name: string;
  detail: string;
}

interface ScheduledTransfer {
  name: string;
  amount: string;
  frequency: string;
  status: string;
  icon: IconName;
}

interface RecentActivity {
  type: string;
  name: string;
  amount: string;
  tone: "credit" | "debit" | "neutral" | "danger";
  icon: IconName;
}

interface InfrastructureItem {
  label: string;
  status: string;
  tone: "green" | "amber" | "gray";
}

// TODO: Connect SGE API transfers endpoint
// TODO: Connect Aether Ledger transaction creation
// TODO: Connect Aether Identity authorization flow
// TODO: Connect notifications service
// TODO: Connect transfer confirmation with Face ID / Android Biometrics
// TODO: Connect audit logs

// TODO: Connect SGE API account spaces
const accountSpaces: AccountSpace[] = [
  { name: "Personnel", balance: "€12,450.80", icon: "person" },
  { name: "Collaborateur SGE", balance: "€2,000.00", icon: "badge" },
  { name: "SGE Europe", balance: "€45,000.00", icon: "business" },
  { name: "Aether Office", balance: "€3,000.00", icon: "workspaces" },
];

// TODO: Connect SEPA transfer rail
// TODO: Connect Wero integration
// TODO: Connect international transfers
// TODO: Connect organization transfer endpoint
const transferRails: TransferRail[] = [
  { name: "SEPA", description: "Virement bancaire européen", icon: "euro" },
  { name: "Wero", description: "Paiement instantané européen", icon: "bolt" },
  { name: "International", description: "Transfert hors zone SEPA", icon: "public" },
  { name: "Organisation", description: "Transfert entre entités SGE", icon: "domain" },
];

const recentBeneficiaries: Beneficiary[] = [
  { initials: "LD", name: "Liam Dispa", detail: "Dernier virement : €4.01" },
  { initials: "ML", name: "Mathis Luymoyen", detail: "Dernier virement : €120.00" },
  { initials: "SG", name: "Sky Genesis Enterprise", detail: "Salaire / organisation" },
  { initials: "AO", name: "Aether Office", detail: "Compte interne" },
];

const scheduledTransfers: ScheduledTransfer[] = [
  { name: "Hostinger", amount: "€29.99", frequency: "Mensuel", status: "Actif", icon: "dns" },
  { name: "Netflix", amount: "€15.99", frequency: "Mensuel", status: "Actif", icon: "movie" },
  { name: "Épargne Infrastructure", amount: "€500.00", frequency: "Chaque mois", status: "Actif", icon: "savings" },
];

const recentTransferActivity: RecentActivity[] = [
  { type: "Virement envoyé", name: "Liam Dispa", amount: "-€4.01", tone: "debit", icon: "arrow-upward" },
  { type: "Virement reçu", name: "Sky Genesis Enterprise", amount: "+€8,500.00", tone: "credit", icon: "arrow-downward" },
  { type: "Transfert interne", name: "Personnel → Vault Infrastructure", amount: "-€500.00", tone: "neutral", icon: "shuffle" },
  { type: "Paiement refusé", name: "Hostinger", amount: "Solde insuffisant", tone: "danger", icon: "block" },
];

const infrastructure: InfrastructureItem[] = [
  { label: "SGE API", status: "Operational", tone: "green" },
  { label: "Aether Ledger", status: "Operational", tone: "green" },
  { label: "SEPA", status: "Sandbox", tone: "amber" },
  { label: "Wero", status: "Planned", tone: "gray" },
];

const quickActions: QuickAction[] = [
  { title: "Envoyer", icon: "arrow-upward" },
  { title: "Recevoir", icon: "arrow-downward" },
  { title: "Entre mes comptes", icon: "shuffle" },
  { title: "Nouveau bénéficiaire", icon: "person-add" },
];

export default function TransfertsScreen() {
  const insets = usePhoneSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);

  useTabScrollToTop("transferts", scrollRef);

  return (
    <ScreenTransition>
      <View style={styles.safeArea}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <TransfertsHeader />

          <HeroSection />

          <QuickActionRow />

          <TransferRailsSection />

          <AccountSpacesSection />

          <BeneficiariesSection />

          <ScheduledTransfersSection />
          <SecurityCard />
          <Footer />
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function TransfertsHeader() {
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

        <Pressable style={styles.headerUtilityButton}>
          <MaterialIcons name="calendar-today" size={21} color="#111827" />
          <Text style={styles.headerUtilityLabel}>Historique</Text>
        </Pressable>

        <Pressable style={styles.headerUtilityButton}>
          <MaterialIcons name="add" size={21} color="#111827" />
          <Text style={styles.headerUtilityLabel}>Nouveau</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HeroSection() {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroEyebrow}>Virements</Text>
      <Text style={styles.heroSubtitle}>Déplacez votre argent en toute sécurité.</Text>
      <View style={styles.heroBalanceCard}>
        <Text style={styles.heroBalanceLabel}>Personnel · EUR</Text>
        <Text style={styles.heroBalanceAmount}>€12,450.80</Text>
        <Text style={styles.heroBalanceMeta}>Disponible</Text>
      </View>
      <Text style={styles.heroProtectionBadge}>
        <MaterialIcons name="verified-user" size={12} color="rgba(255,255,255,0.4)" /> Protégé par Aether Identity
      </Text>
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

function TransferRailsSection() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Méthodes de transfert</Text>
      {transferRails.map((rail) => (
        <Pressable key={rail.name} style={styles.railRow}>
          <View style={styles.railIcon}>
            <MaterialIcons name={rail.icon} size={20} color="#111827" />
          </View>
          <View style={styles.railInfo}>
            <Text style={styles.railName}>{rail.name}</Text>
            <Text style={styles.railDescription}>{rail.description}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
        </Pressable>
      ))}
    </View>
  );
}

function AccountSpacesSection() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Mes comptes</Text>
      {accountSpaces.map((account) => (
        <Pressable key={account.name} style={styles.accountRow}>
          <View style={styles.accountIcon}>
            <MaterialIcons name={account.icon} size={20} color="#111827" />
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountBalance}>{account.balance}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
        </Pressable>
      ))}
      {/* TODO: Connect SGE API account spaces */}
      {/* TODO: Connect financial permissions */}
    </View>
  );
}

function BeneficiariesSection() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Bénéficiaires récents</Text>
      {recentBeneficiaries.map((beneficiary) => (
        <Pressable key={beneficiary.name} style={styles.beneficiaryRow}>
          <View style={styles.beneficiaryAvatar}>
            <Text style={styles.beneficiaryInitials}>{beneficiary.initials}</Text>
          </View>
          <View style={styles.beneficiaryInfo}>
            <Text style={styles.beneficiaryName}>{beneficiary.name}</Text>
            <Text style={styles.beneficiaryDetail}>{beneficiary.detail}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
        </Pressable>
      ))}
    </View>
  );
}

function ScheduledTransfersSection() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>Virements programmés</Text>
        <Text style={styles.cardAction}>Voir tout</Text>
      </View>
      {scheduledTransfers.map((transfer) => (
        <View key={transfer.name} style={styles.scheduledRow}>
          <View style={styles.scheduledIcon}>
            <MaterialIcons name={transfer.icon} size={20} color="#111827" />
          </View>
          <View style={styles.scheduledInfo}>
            <Text style={styles.scheduledName}>{transfer.name}</Text>
            <Text style={styles.scheduledMeta}>
              {transfer.amount} · {transfer.frequency}
            </Text>
          </View>
          <View style={styles.scheduledStatusBadge}>
            <Text style={styles.scheduledStatusText}>{transfer.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function SecurityCard() {
  return (
    <View style={styles.securityCard}>
      <View style={styles.securityContent}>
        <View style={styles.securityIcon}>
          <MaterialIcons name="fingerprint" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.securityCopy}>
          <Text style={styles.securityTitle}>Transferts sécurisés</Text>
          <Text style={styles.securityText}>
            Aether Identity vérifie chaque opération sensible. Activez Face ID pour confirmer vos virements.
          </Text>
        </View>
      </View>
      <Pressable style={styles.securityButton}>
        <Text style={styles.securityButtonText}>Configurer</Text>
      </Pressable>
      {/* TODO: Connect biometric transfer confirmation */}
      {/* TODO: Connect transfer risk engine */}
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
    padding: 20,
    marginBottom: 18,
    backgroundColor: "#111827",
  },
  heroEyebrow: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
    marginBottom: 18,
  },
  heroBalanceCard: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  heroBalanceLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  heroBalanceAmount: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
    marginTop: 4,
  },
  heroBalanceMeta: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  heroProtectionBadge: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
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
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardAction: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  railRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  railIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  railInfo: {
    flex: 1,
  },
  railName: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  railDescription: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 1,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  accountIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  accountBalance: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 1,
  },
  beneficiaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  beneficiaryAvatar: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#111827",
  },
  beneficiaryInitials: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  beneficiaryInfo: {
    flex: 1,
  },
  beneficiaryName: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  beneficiaryDetail: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 1,
  },
  scheduledRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  scheduledIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  scheduledInfo: {
    flex: 1,
  },
  scheduledName: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  scheduledMeta: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 1,
  },
  scheduledStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#E8F5E9",
  },
  scheduledStatusText: {
    color: "#1F8A4C",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  activityIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  activityName: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 1,
  },
  activityAmount: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  activityCredit: {
    color: "#1F8A4C",
  },
  activityDebit: {
    color: "#111827",
  },
  activityNeutral: {
    color: "#6B7280",
  },
  activityDanger: {
    color: "#BD2E2E",
  },
  securityCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#111827",
  },
  securityContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 14,
  },
  securityIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  securityCopy: {
    flex: 1,
  },
  securityTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  securityText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 2,
  },
  securityButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  securityButtonText: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
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
