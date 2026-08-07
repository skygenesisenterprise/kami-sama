import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { useTabScrollToTop } from "@/components/mobile/tab-scroll-to-top";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

type VaultType = "goal" | "reserve" | "locked" | "shared" | "business";
type VaultAvailability = "instant" | "locked" | "scheduled";
type VaultStatus = "active" | "paused" | "completed";

interface Vault {
  id: string;
  name: string;
  type: VaultType;
  currency: "EUR" | "USD" | "JPY";
  balanceMinor: number;
  targetMinor?: number;
  linkedAccountId: string;
  availability: VaultAvailability;
  status: VaultStatus;
  targetDate?: string;
  icon: IconName;
}

interface VaultAutomation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: "percentage_incoming" | "round_up" | "scheduled_transfer";
}

interface VaultActivity {
  id: string;
  amountMinor: number;
  currency: "EUR" | "USD" | "JPY";
  direction: "in" | "out";
  vaultName: string;
  counterparty: string;
  timeLabel: string;
  status: "completed" | "pending";
}

interface VaultScreenData {
  summary: {
    totalBalanceMinor: number;
    availableMinor: number;
    lockedMinor: number;
    currency: "EUR" | "USD" | "JPY";
    activeVaultCount: number;
  };
  vaults: Vault[];
  automations: VaultAutomation[];
  activity: VaultActivity[];
}

const vaultScreenData: VaultScreenData = {
  summary: {
    totalBalanceMinor: 409000,
    availableMinor: 294000,
    lockedMinor: 115000,
    currency: "EUR",
    activeVaultCount: 3,
  },
  vaults: [
    {
      id: "vault-infrastructure",
      name: "Infrastructure",
      type: "goal",
      currency: "EUR",
      balanceMinor: 85000,
      targetMinor: 300000,
      linkedAccountId: "aether-salary",
      availability: "instant",
      status: "active",
      targetDate: "Objectif · décembre 2026",
      icon: "dns",
    },
    {
      id: "vault-japan",
      name: "Voyage Japon",
      type: "goal",
      currency: "EUR",
      balanceMinor: 124000,
      targetMinor: 500000,
      linkedAccountId: "aether-salary",
      availability: "instant",
      status: "active",
      targetDate: "Objectif · avril 2027",
      icon: "flight",
    },
    {
      id: "vault-safety",
      name: "Réserve de sécurité",
      type: "locked",
      currency: "EUR",
      balanceMinor: 200000,
      linkedAccountId: "sge-operations",
      availability: "locked",
      status: "active",
      targetDate: "Déblocage manuel requis",
      icon: "lock",
    },
  ],
  automations: [
    {
      id: "auto-income-safety",
      name: "Réserve de sécurité",
      description: "20 % des revenus entrants vers Réserve de sécurité.",
      enabled: true,
      type: "percentage_incoming",
    },
    {
      id: "auto-roundup-infra",
      name: "Arrondi Infrastructure",
      description: "Arrondi des paiements vers Infrastructure.",
      enabled: true,
      type: "round_up",
    },
    {
      id: "auto-japan-monthly",
      name: "Versement Voyage Japon",
      description: "100 € le premier du mois vers Voyage Japon.",
      enabled: false,
      type: "scheduled_transfer",
    },
  ],
  activity: [
    {
      id: "activity-1",
      amountMinor: 10000,
      currency: "EUR",
      direction: "in",
      vaultName: "Infrastructure",
      counterparty: "Depuis Aether Salary",
      timeLabel: "Aujourd'hui · 14:32",
      status: "completed",
    },
    {
      id: "activity-2",
      amountMinor: 40000,
      currency: "EUR",
      direction: "in",
      vaultName: "Réserve de sécurité",
      counterparty: "Règle automatique",
      timeLabel: "Aujourd'hui · 09:10",
      status: "completed",
    },
    {
      id: "activity-3",
      amountMinor: 5000,
      currency: "EUR",
      direction: "out",
      vaultName: "Voyage Japon",
      counterparty: "Transfert vers compte principal",
      timeLabel: "Hier · 18:48",
      status: "completed",
    },
  ],
};

function formatMoney(amountMinor: number, currency: "EUR" | "USD" | "JPY") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(amountMinor / 100);
}

function getVaultTypeLabel(type: VaultType) {
  switch (type) {
    case "goal":
      return "Objectif";
    case "reserve":
      return "Réserve";
    case "locked":
      return "Réserve verrouillée";
    case "shared":
      return "Partagé";
    case "business":
      return "Professionnel";
  }
}

function getAvailabilityLabel(availability: VaultAvailability) {
  switch (availability) {
    case "instant":
      return "Disponible immédiatement";
    case "locked":
      return "Fonds verrouillés";
    case "scheduled":
      return "Disponibilité planifiée";
  }
}

export default function VaultScreen() {
  const insets = usePhoneSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);
  const [automations, setAutomations] = React.useState(vaultScreenData.automations);

  useTabScrollToTop("vault", scrollRef);

  const handleAddVault = React.useCallback(() => {
    router.push("/vault-create");
  }, []);

  const handleQuickAction = React.useCallback((title: string) => {
    if (title === "Ajouter des fonds") {
      router.push("/vault-fund");
      return;
    }

    if (title === "Créer un Vault") {
      router.push("/vault-create");
      return;
    }

    if (title === "Automatisations") {
      router.push("/vault-workflows");
      return;
    }

    Alert.alert(title, `${title} sera relié prochainement au parcours Vault.`, [{ text: "OK" }]);
  }, []);

  const handleVaultPress = React.useCallback((vault: Vault) => {
    Alert.alert(vault.name, `${getVaultTypeLabel(vault.type)}\n${formatMoney(vault.balanceMinor, vault.currency)}\n${getAvailabilityLabel(vault.availability)}`, [{ text: "OK" }]);
  }, []);

  const handleAutomationToggle = React.useCallback((automationId: string) => {
    setAutomations((currentAutomations) =>
      currentAutomations.map((automation) =>
        automation.id === automationId ? { ...automation, enabled: !automation.enabled } : automation,
      ),
    );
  }, []);

  return (
    <ScreenTransition>
      <View style={styles.safeArea}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <VaultHeader onAddVault={handleAddVault} />

          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>Vault</Text>
            <Text style={styles.pageSubtitle}>Organisez et protégez vos réserves</Text>
          </View>

          <SummaryCard summary={vaultScreenData.summary} />

          <QuickActionsRow onActionPress={handleQuickAction} />

          <SectionTitle title="Vos Vaults" />
          {vaultScreenData.vaults.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="inventory-2" size={24} color="#6B7280" />
              <Text style={styles.emptyTitle}>Aucun Vault pour le moment</Text>
              <Text style={styles.emptyDescription}>
                Créez un espace pour réserver de l’argent à un projet ou à une réserve.
              </Text>
            </View>
          ) : (
            vaultScreenData.vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} onPress={handleVaultPress} />
            ))
          )}

          <View style={styles.sectionCard}>
            <SectionHeader title="Automatisations" action="Configurer" />
            {automations.map((automation, index) => (
              <View key={automation.id} style={[styles.automationRow, index < automations.length - 1 && styles.rowBorder]}>
                <View style={styles.automationCopy}>
                  <Text style={styles.automationTitle}>{automation.name}</Text>
                  <Text style={styles.automationDescription}>{automation.description}</Text>
                  <Text style={styles.automationMeta}>
                    {automation.enabled ? "Activée" : "Désactivée"} · {automation.type.replaceAll("_", " ")}
                  </Text>
                </View>
                <Switch
                  accessibilityLabel={`Basculer ${automation.name}`}
                  trackColor={{ false: "#D1D5DB", true: "#BFDBFE" }}
                  thumbColor={automation.enabled ? "#2563EB" : "#F9FAFB"}
                  value={automation.enabled}
                  onValueChange={() => handleAutomationToggle(automation.id)}
                />
              </View>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <SectionHeader title="Activité récente" />
            {vaultScreenData.activity.map((item, index) => (
              <View key={item.id} style={[styles.activityRow, index < vaultScreenData.activity.length - 1 && styles.rowBorder]}>
                <View style={[styles.activityIcon, item.direction === "in" ? styles.activityIconPositive : styles.activityIconNegative]}>
                  <MaterialIcons
                    name={item.direction === "in" ? "south-west" : "north-east"}
                    size={16}
                    color={item.direction === "in" ? "#166534" : "#92400E"}
                  />
                </View>
                <View style={styles.activityCopy}>
                  <View style={styles.activityTitleRow}>
                    <Text style={styles.activityAmount}>
                      {item.direction === "in" ? "+" : "-"}
                      {formatMoney(item.amountMinor, item.currency)}
                    </Text>
                    <Text style={styles.activityStatus}>{item.status === "completed" ? "Confirmé" : "En attente"}</Text>
                  </View>
                  <Text style={styles.activityVault}>vers {item.vaultName}</Text>
                  <Text style={styles.activityCounterparty}>{item.counterparty}</Text>
                  <Text style={styles.activityTime}>{item.timeLabel}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.infoNote}>
            <MaterialIcons name="info-outline" size={14} color="#6B7280" />
            <Text style={styles.infoNoteText}>
              TODO: brancher plus tard les endpoints `/v1/mobile/vaults`, `/v1/vaults/{'{'}vaultId{'}'}` et `/v1/vault-automations`.
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function VaultHeader({ onAddVault }: { onAddVault: () => void }) {
  return (
    <View style={styles.headerBlock}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerChip}>
          <MaterialIcons name="lock" size={14} color="#111827" />
          <Text style={styles.headerChipText}>Réserves Aether</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerUtilityButton} onPress={() => router.push("/analytics")}>
            <MaterialIcons name="bar-chart" size={21} color="#111827" />
            <Text style={styles.headerUtilityLabel}>Analyse</Text>
          </Pressable>

          <Pressable accessibilityLabel="Créer un Vault" style={styles.headerUtilityButton} onPress={onAddVault}>
            <MaterialIcons name="add-circle-outline" size={21} color="#111827" />
            <Text style={styles.headerUtilityLabel}>Créer</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.headerSummaryCard}>
        <View style={styles.headerSummaryIcon}>
          <MaterialIcons name="inventory-2" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.headerSummaryCopy}>
          <Text style={styles.headerSummaryTitle}>Espaces de réserve</Text>
          <Text style={styles.headerSummaryText}>
            Isolez, automatisez et suivez vos fonds protégés sans quitter votre compte principal.
          </Text>
        </View>
      </View>
    </View>
  );
}

function SummaryCard({ summary }: { summary: VaultScreenData["summary"] }) {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroLabel}>Total protégé</Text>
      <Text style={styles.heroValue}>{formatMoney(summary.totalBalanceMinor, summary.currency)}</Text>
      <Text style={styles.heroDisclaimer}>
        Répartition interne des fonds. Ce statut n’implique pas une garantie réglementaire spécifique.
      </Text>
      <View style={styles.heroStatsRow}>
        <SummaryStat label="Vaults actifs" value={summary.activeVaultCount.toString()} />
        <SummaryStat label="Disponibles" value={formatMoney(summary.availableMinor, summary.currency)} positive />
        <SummaryStat label="Verrouillés" value={formatMoney(summary.lockedMinor, summary.currency)} locked />
      </View>
    </View>
  );
}

function SummaryStat({
  label,
  value,
  positive = false,
  locked = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
  locked?: boolean;
}) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryStatLabel}>{label}</Text>
      <Text style={[styles.summaryStatValue, positive && styles.summaryStatValuePositive, locked && styles.summaryStatValueLocked]}>
        {value}
      </Text>
    </View>
  );
}

function QuickActionsRow({ onActionPress }: { onActionPress: (title: string) => void }) {
  const quickActions = [
    { title: "Ajouter des fonds", icon: "add" as IconName },
    { title: "Créer un Vault", icon: "inventory-2" as IconName },
    { title: "Automatisations", icon: "sync-alt" as IconName },
  ];

  return (
    <View style={styles.quickActionRow}>
      {quickActions.map((action) => (
        <Pressable
          key={action.title}
          accessibilityLabel={action.title}
          style={styles.quickAction}
          onPress={() => onActionPress(action.title)}
        >
          <View style={styles.quickActionIcon}>
            <MaterialIcons name={action.icon} size={20} color="#111827" />
          </View>
          <Text style={styles.quickActionText}>{action.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function VaultCard({ vault, onPress }: { vault: Vault; onPress: (vault: Vault) => void }) {
  const progress =
    vault.targetMinor && vault.targetMinor > 0
      ? Math.min(vault.balanceMinor / vault.targetMinor, 1)
      : null;

  return (
    <Pressable
      accessibilityLabel={`Ouvrir ${vault.name}`}
      style={styles.vaultCard}
      onPress={() => onPress(vault)}
    >
      <View style={styles.vaultHeader}>
        <View style={styles.vaultLeading}>
          <View style={styles.vaultIcon}>
            <MaterialIcons name={vault.icon} size={18} color="#111827" />
          </View>
          <View style={styles.vaultCopy}>
            <Text style={styles.vaultName}>{vault.name}</Text>
            <Text style={styles.vaultMeta}>{getVaultTypeLabel(vault.type)}</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>

      <View style={styles.vaultBalanceRow}>
        <Text style={styles.vaultBalance}>{formatMoney(vault.balanceMinor, vault.currency)}</Text>
        <View style={[styles.statusBadge, vault.availability === "instant" ? styles.statusBadgePositive : styles.statusBadgeLocked]}>
          <Text style={[styles.statusBadgeText, vault.availability === "instant" ? styles.statusBadgeTextPositive : styles.statusBadgeTextLocked]}>
            {getAvailabilityLabel(vault.availability)}
          </Text>
        </View>
      </View>

      {progress !== null ? (
        <>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Objectif</Text>
            <Text style={styles.progressValue}>
              {formatMoney(vault.balanceMinor, vault.currency)} / {formatMoney(vault.targetMinor ?? 0, vault.currency)}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </>
      ) : null}

      {vault.targetDate ? <Text style={styles.vaultTargetDate}>{vault.targetDate}</Text> : null}
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitleStandalone}>{title}</Text>;
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
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
    marginBottom: 18,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#E5EEF9",
  },
  headerChipText: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerSummaryCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    backgroundColor: "#111827",
  },
  headerSummaryIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  headerSummaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerSummaryTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  headerSummaryText: {
    color: "#D1D5DB",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 4,
  },
  titleBlock: {
    marginBottom: 18,
  },
  pageTitle: {
    color: "#05070A",
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
  },
  pageSubtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  headerUtilityButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
  },
  headerUtilityLabel: {
    position: "absolute",
    opacity: 0,
    fontSize: 1,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    backgroundColor: "#111827",
  },
  heroLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroValue: {
    color: "#FFFFFF",
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "900",
    marginTop: 10,
  },
  heroDisclaimer: {
    color: "#D1D5DB",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 10,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  summaryStat: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  summaryStatLabel: {
    color: "#D1D5DB",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  summaryStatValue: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    marginTop: 6,
  },
  summaryStatValuePositive: {
    color: "#86EFAC",
  },
  summaryStatValueLocked: {
    color: "#FDE68A",
  },
  quickActionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
  },
  quickActionText: {
    color: "#374151",
    textAlign: "center",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
  },
  sectionTitleStandalone: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    marginBottom: 12,
  },
  vaultCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  vaultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  vaultLeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  vaultIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  vaultCopy: {
    flex: 1,
  },
  vaultName: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  vaultMeta: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  vaultBalanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 14,
  },
  vaultBalance: {
    color: "#05070A",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgePositive: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeLocked: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  statusBadgeTextPositive: {
    color: "#166534",
  },
  statusBadgeTextLocked: {
    color: "#92400E",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 14,
  },
  progressLabel: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  progressValue: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    marginTop: 8,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  vaultTargetDate: {
    color: "#9CA3AF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 10,
  },
  emptyCard: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 24,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  emptyTitle: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    marginTop: 10,
  },
  emptyDescription: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 6,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  sectionTitle: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  sectionAction: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  automationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  automationCopy: {
    flex: 1,
    minWidth: 0,
  },
  automationTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  automationDescription: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 2,
  },
  automationMeta: {
    color: "#9CA3AF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 14,
  },
  activityIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  activityIconPositive: {
    backgroundColor: "#DCFCE7",
  },
  activityIconNegative: {
    backgroundColor: "#FEF3C7",
  },
  activityCopy: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  activityAmount: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  activityStatus: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  activityVault: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 3,
  },
  activityCounterparty: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  activityTime: {
    color: "#9CA3AF",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    marginTop: 4,
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
