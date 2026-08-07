import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { accounts as legacyAccounts } from "@/data/accounts";
import { type Account as MockAccount, getMockAccount } from "@/data/mockAccounts";

export default function AccountDetailScreen() {
  const insets = usePhoneSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const decodedId = id ? decodeURIComponent(id) : "";

  const [refreshing, setRefreshing] = React.useState(false);

  const mockAccount = getMockAccount(decodedId);
  const legacyAccount = legacyAccounts.find((a) => a.id === decodedId);

  const account = mockAccount;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  if (!account) {
    return (
      <ScreenTransition direction="up">
        <View style={styles.safeArea}>
          <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
            <Pressable style={styles.closeButton} onPress={() => router.push("/")}>
              <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>Compte introuvable</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.fallbackContainer}>
            <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
            <Text style={styles.fallbackTitle}>Compte non trouvé</Text>
            <Text style={styles.fallbackSubtitle}>
              Aucun compte ne correspond à cet identifiant.
            </Text>
            {legacyAccount && (
              <Pressable
                style={styles.fallbackButton}
                onPress={() => router.push("/")}
              >
                <Text style={styles.fallbackButtonText}>Retour à l'accueil</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScreenTransition>
    );
  }

  const formattedAvailable = formatEur(account.balance.available);
  const provider = account.provider;
  const card = account.card;
  const iban = account.iban;

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
          <Pressable style={styles.closeButton} onPress={() => router.push("/")}>
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{account.name}</Text>
            <Text style={styles.headerSubtitle}>{accountTypeLabel(account.type)} · {account.currency}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B7280" colors={["#6B7280"]} />}
        >
          {/* A. Balance Summary */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>{account.name}</Text>
            <Text style={styles.heroBalance}>{formattedAvailable}</Text>
            <Text style={styles.heroMeta}>Solde disponible</Text>
            <View style={styles.heroBadges}>
              <LedgerBadge status={account.ledger.status} />
              <ProviderBadge provider={provider} />
            </View>
          </View>

          {/* B. Balance Detail */}
          <SectionCard title="Balance détaillée">
            <BalanceRow label="Solde disponible" value={account.balance.available} bold />
            <BalanceRow label="Solde courant" value={account.balance.current} />
            <BalanceRow label="Montant réservé" value={account.balance.reserved} type="warning" />
            <BalanceRow label="Entrant en attente" value={account.balance.pendingIncoming} type="success" />
            <BalanceRow label="Sortant en attente" value={account.balance.pendingOutgoing} type="warning" last />
          </SectionCard>

          {/* C. Account Identity */}
          <SectionCard title="Identité du compte">
            <InfoRow label="Account ID" value={account.id} mono />
            <InfoDivider />
            <InfoRow label="Type de compte" value={accountTypeLabel(account.type)} />
            <InfoDivider />
            <InfoRow label="Devise" value={account.currency} />
            <InfoDivider />
            <InfoRow label="IBAN" value={iban ? maskIban(iban) : "Non disponible"} />
            {provider && (
              <>
                <InfoDivider />
                <InfoRow label="Provider" value={provider.name} />
              </>
            )}
            {iban && (
              <InfoRow
                label=" "
                value=""
                renderRight={() => (
                  <View style={styles.ibanActions}>
                    <Pressable style={styles.ibanChip} onPress={() => Alert.alert("IBAN copié", account.iban)}>
                      <MaterialIcons name="content-copy" size={14} color="#FFFFFF" />
                      <Text style={styles.ibanChipText}>Copier</Text>
                    </Pressable>
                  </View>
                )}
              />
            )}
          </SectionCard>

          {/* D. Ledger Status */}
          <SectionCard title="Statut Ledger">
            <InfoRow
              label="Source of truth"
              value="Aether Ledger"
              renderRight={() => (
                <View style={styles.ledgerSourceBadge}>
                  <MaterialIcons name="verified" size={14} color="#1F8A4C" />
                  <Text style={styles.ledgerSourceText}>Aether Ledger</Text>
                </View>
              )}
            />
            <InfoDivider />
            <InfoRow label="Statut ledger" renderRight={() => <StatusBadge status={account.ledger.status} />} />
            <InfoDivider />
            <InfoRow label="Dernière entrée" value={account.ledger.lastEntryId} mono />
            {account.ledger.lastSyncAt && (
              <>
                <InfoDivider />
                <InfoRow label="Dernière sync" value={formatDate(account.ledger.lastSyncAt)} />
              </>
            )}
            {provider && (
              <>
                <InfoDivider />
                <InfoRow label="Sync provider" renderRight={() => <SyncBadge status={provider!.syncStatus} />} />
              </>
            )}
          </SectionCard>

          {/* E. Linked Card */}
          <SectionCard title="Carte liée">
            {card ? (
              <>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <MaterialIcons
                      name={card.type === "virtual" ? "credit-card" : "style"}
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardType}>
                      {card.type === "virtual" ? "Carte Virtuelle" : "Carte Physique"}
                    </Text>
                    <Text style={styles.cardLast4}>**** {card.last4}</Text>
                  </View>
                  <View style={[styles.cardStatusDot, card.status === "active" ? styles.cardStatusActive : styles.cardStatusFrozen]} />
                </View>
                <InfoDivider />
                <InfoRow label="Statut" renderRight={() => <CardStatusBadge status={card.status} />} />
                <InfoDivider />
                <InfoRow label="Apple Pay" renderRight={() => <ApplePayBadge status={card.applePayStatus} />} />
                <InfoDivider />
                <InfoRow label="Limite mensuelle" value={formatEur(card.monthlyLimit)} />
                <View style={styles.cardActions}>
                  <Pressable style={styles.cardAction} onPress={() => Alert.alert("Carte", "Détails de la carte")}>
                    <MaterialIcons name="visibility" size={16} color="#FFFFFF" />
                    <Text style={styles.cardActionText}>Voir la carte</Text>
                  </Pressable>
                  <Pressable style={styles.cardActionOutline} onPress={() => Alert.alert("Carte", "Carte gelée")}>
                    <MaterialIcons name="ac-unit" size={16} color="#111827" />
                    <Text style={styles.cardActionOutlineText}>Geler</Text>
                  </Pressable>
                  <Pressable style={styles.cardActionOutline} onPress={() => Alert.alert("Apple Pay", "Ajout à Apple Pay")}>
                    <MaterialIcons name="smartphone" size={16} color="#111827" />
                    <Text style={styles.cardActionOutlineText}>Wallet</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.noCardContainer}>
                <MaterialIcons name="credit-card-off" size={32} color="#9CA3AF" />
                <Text style={styles.noCardTitle}>Aucune carte liée</Text>
                <Text style={styles.noCardSubtitle}>Ce compte ne possède pas encore de carte.</Text>
                <Pressable style={styles.issueCardButton} onPress={() => Alert.alert("Carte", "Création d'une carte virtuelle")}>
                  <MaterialIcons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.issueCardText}>Créer une carte virtuelle</Text>
                </Pressable>
              </View>
            )}
          </SectionCard>

          {/* F. Recent Activity */}
          <SectionCard title="Activité récente">
            {account.transactions.length === 0 ? (
              <Text style={styles.emptyText}>Aucune transaction récente.</Text>
            ) : (
              account.transactions.map((txn) => (
                <TransactionRow key={txn.id} transaction={txn} />
              ))
            )}
          </SectionCard>

          {/* G. Limits & Security */}
          <SectionCard title="Limites et sécurité" last>
            <View style={styles.limitRow}>
              <MaterialIcons name="swap-horiz" size={16} color="#6B7280" />
              <Text style={styles.limitLabel}>Limite virement journalière</Text>
              <Text style={styles.limitValue}>{formatEur(10000)}</Text>
            </View>
            <InfoDivider />
            <View style={styles.limitRow}>
              <MaterialIcons name="credit-card" size={16} color="#6B7280" />
              <Text style={styles.limitLabel}>Limite carte mensuelle</Text>
              <Text style={styles.limitValue}>{card ? formatEur(card.monthlyLimit) : "—"}</Text>
            </View>
            <InfoDivider />
            <View style={styles.limitRow}>
              <MaterialIcons name="security" size={16} color="#6B7280" />
              <Text style={styles.limitLabel}>MFA requis</Text>
              <Text style={styles.limitValue}>Oui</Text>
            </View>
            <InfoDivider />
            <View style={styles.limitRow}>
              <MaterialIcons name="fingerprint" size={16} color="#6B7280" />
              <Text style={styles.limitLabel}>Actions sensibles</Text>
              <Text style={styles.limitValue}>Vérification biométrique</Text>
            </View>
          </SectionCard>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

/* ---------- Sub-components ---------- */

function SectionCard({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[styles.sectionCard, last && { marginBottom: 0 }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, mono, renderRight }: { label: string; value?: string; mono?: boolean; renderRight?: () => React.ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {renderRight ? (
        renderRight()
      ) : (
        <Text style={[styles.infoValue, mono && styles.infoValueMono]} numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
  );
}

function InfoDivider() {
  return <View style={styles.infoDivider} />;
}

function BalanceRow({ label, value, bold, type, last }: { label: string; value: number; bold?: boolean; type?: "success" | "warning"; last?: boolean }) {
  const color = type === "success" ? "#1F8A4C" : type === "warning" ? "#D97706" : "#05070A";
  return (
    <View style={[styles.balanceRow, !last && styles.balanceRowBorder]}>
      <Text style={styles.balanceLabel}>{label}</Text>
      <Text style={[styles.balanceValue, bold && styles.balanceValueBold, { color }]}>
        {type === "success" ? "+" : type === "warning" ? "−" : ""}{formatEur(value)}
      </Text>
    </View>
  );
}

function StatusBadge({ status }: { status: "confirmed" | "pending" | "error" }) {
  const config: Record<string, { label: string; bg: string; fg: string; icon: string }> = {
    confirmed: { label: "Confirmé", bg: "#DCFCE7", fg: "#166534", icon: "check-circle" },
    pending: { label: "En attente", bg: "#FEF3C7", fg: "#92400E", icon: "access-time" },
    error: { label: "Erreur", bg: "#FEE2E2", fg: "#991B1B", icon: "error" },
  };
  const c = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <MaterialIcons name={c.icon as any} size={12} color={c.fg} />
      <Text style={[styles.badgeText, { color: c.fg }]}>{c.label}</Text>
    </View>
  );
}

function LedgerBadge({ status }: { status: "confirmed" | "pending" | "error" }) {
  const config: Record<string, { label: string; bg: string; fg: string }> = {
    confirmed: { label: "Ledger ✓", bg: "#DCFCE7", fg: "#166534" },
    pending: { label: "Ledger ⏳", bg: "#FEF3C7", fg: "#92400E" },
    error: { label: "Ledger ✗", bg: "#FEE2E2", fg: "#991B1B" },
  };
  const c = config[status];
  return (
    <View style={[styles.heroBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.heroBadgeText, { color: c.fg }]}>{c.label}</Text>
    </View>
  );
}

function ProviderBadge({ provider }: { provider?: { name: string; syncStatus: string } }) {
  if (!provider) {
    return (
      <View style={[styles.heroBadge, { backgroundColor: "#F3F4F6" }]}>
        <Text style={[styles.heroBadgeText, { color: "#6B7280" }]}>Aucun provider</Text>
      </View>
    );
  }
  const isSynced = provider.syncStatus === "synced";
  return (
    <View style={[styles.heroBadge, { backgroundColor: isSynced ? "#DCFCE7" : "#FEF3C7" }]}>
      <Text style={[styles.heroBadgeText, { color: isSynced ? "#166534" : "#92400E" }]}>
        {provider.name} {isSynced ? "✓" : "⏳"}
      </Text>
    </View>
  );
}

function SyncBadge({ status }: { status: "synced" | "pending" | "failed" | "not_connected" }) {
  const config: Record<string, { label: string; bg: string; fg: string }> = {
    synced: { label: "Synchronisé", bg: "#DCFCE7", fg: "#166534" },
    pending: { label: "Sync en cours", bg: "#FEF3C7", fg: "#92400E" },
    failed: { label: "Échec sync", bg: "#FEE2E2", fg: "#991B1B" },
    not_connected: { label: "Non connecté", bg: "#F3F4F6", fg: "#6B7280" },
  };
  const c = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{c.label}</Text>
    </View>
  );
}

function CardStatusBadge({ status }: { status: "active" | "frozen" | "pending" }) {
  const config: Record<string, { label: string; bg: string; fg: string }> = {
    active: { label: "Active", bg: "#DCFCE7", fg: "#166534" },
    frozen: { label: "Gelée", bg: "#F3F4F6", fg: "#6B7280" },
    pending: { label: "En attente", bg: "#FEF3C7", fg: "#92400E" },
  };
  const c = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{c.label}</Text>
    </View>
  );
}

function ApplePayBadge({ status }: { status: "ready" | "not_added" | "unsupported" }) {
  const config: Record<string, { label: string; bg: string; fg: string }> = {
    ready: { label: "Apple Pay ✓", bg: "#DCFCE7", fg: "#166534" },
    not_added: { label: "Non ajouté", bg: "#F3F4F6", fg: "#6B7280" },
    unsupported: { label: "Non supporté", bg: "#FEE2E2", fg: "#991B1B" },
  };
  const c = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{c.label}</Text>
    </View>
  );
}

function TransactionRow({ transaction }: { transaction: { id: string; label: string; amount: number; currency: string; type: string; status: string; date: string; method: string } }) {
  const isIncoming = transaction.type === "incoming";
  const statusConfig: Record<string, { bg: string; fg: string }> = {
    confirmed: { bg: "#DCFCE7", fg: "#166534" },
    pending: { bg: "#FEF3C7", fg: "#92400E" },
    failed: { bg: "#FEE2E2", fg: "#991B1B" },
  };
  const sc = statusConfig[transaction.status] || statusConfig.confirmed;
  const methodLabel: Record<string, string> = {
    ledger: "Ledger",
    card: "Carte",
    transfer: "Virement",
    apple_pay: "Apple Pay",
    provider_sync: "Sync provider",
  };

  return (
    <View style={styles.txnRow}>
      <View style={styles.txnLeft}>
        <View style={[styles.txnDot, { backgroundColor: isIncoming ? "#DCFCE7" : "#FEE2E2" }]}>
          <MaterialIcons
            name={isIncoming ? "arrow-downward" : "arrow-upward"}
            size={14}
            color={isIncoming ? "#1F8A4C" : "#DC2626"}
          />
        </View>
        <View style={styles.txnInfo}>
          <Text style={styles.txnLabel}>{transaction.label}</Text>
          <Text style={styles.txnMeta}>{methodLabel[transaction.method] || transaction.method}</Text>
        </View>
      </View>
      <View style={styles.txnRight}>
        <Text style={[styles.txnAmount, { color: isIncoming ? "#1F8A4C" : "#05070A" }]}>
          {isIncoming ? "+" : "−"}{formatEur(transaction.amount)}
        </Text>
        <View style={[styles.txnStatusDot, { backgroundColor: sc.bg }]}>
          <Text style={[styles.txnStatusText, { color: sc.fg }]}>{transaction.status}</Text>
        </View>
      </View>
    </View>
  );
}

/* ---------- Helpers ---------- */

function formatEur(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(amount);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function accountTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    personal: "Personnel",
    business: "Professionnel",
    reserve: "Réserve",
    ledger_only: "Ledger uniquement",
  };
  return labels[type] || type;
}

function maskIban(iban: string): string {
  if (iban.length <= 8) return iban;
  return iban.slice(0, 4) + " ●●●● ●●●● " + iban.slice(-4);
}

/* ---------- Fallback Screen ---------- */

function FallbackScreen({ insets, legacyAccount }: { insets: { top: number }; legacyAccount?: { id: string } }) {
  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
          <Pressable style={styles.closeButton} onPress={() => router.push("/")}>
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Compte introuvable</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.fallbackContainer}>
          <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
          <Text style={styles.fallbackTitle}>Compte non trouvé</Text>
          <Text style={styles.fallbackSubtitle}>
            Aucun compte ne correspond à cet identifiant.
          </Text>
          {legacyAccount && (
            <Pressable style={styles.fallbackButton} onPress={() => router.push("/")}>
              <Text style={styles.fallbackButtonText}>Retour à l'accueil</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScreenTransition>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#111827",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  headerSpacer: {
    width: 42,
  },
  heroCard: {
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  heroLabel: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroBalance: {
    color: "#05070A",
    fontSize: 42,
    lineHeight: 50,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroMeta: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 18,
  },
  heroBadges: {
    flexDirection: "row",
    gap: 8,
  },
  heroBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroBadgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    minHeight: 36,
  },
  infoLabel: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
    color: "#05070A",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    textAlign: "right",
    maxWidth: "55%",
  },
  infoValueMono: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    letterSpacing: 0.3,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  /* Balance detail */
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  balanceRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  balanceLabel: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  balanceValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  balanceValueBold: {
    fontSize: 18,
    lineHeight: 24,
  },
  /* IBAN */
  ibanActions: {
    flexDirection: "row",
    gap: 6,
  },
  ibanChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#111827",
  },
  ibanChipText: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  /* Ledger */
  ledgerSourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#DCFCE7",
  },
  ledgerSourceText: {
    color: "#166534",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  /* Card */
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  cardIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  cardInfo: {
    flex: 1,
  },
  cardType: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  cardLast4: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 1,
  },
  cardStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardStatusActive: {
    backgroundColor: "#1F8A4C",
  },
  cardStatusFrozen: {
    backgroundColor: "#9CA3AF",
  },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  cardAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#111827",
  },
  cardActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  cardActionOutline: {
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
  cardActionOutlineText: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  noCardContainer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  noCardTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  noCardSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  issueCardButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#111827",
    marginTop: 8,
  },
  issueCardText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  /* Transactions */
  txnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  txnLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  txnDot: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  txnInfo: {
    flex: 1,
  },
  txnLabel: {
    color: "#05070A",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  txnMeta: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 1,
  },
  txnRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  txnAmount: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  txnStatusDot: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  txnStatusText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  /* Limits */
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  limitLabel: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    flex: 1,
  },
  limitValue: {
    color: "#05070A",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  /* Empty */
  emptyText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 12,
  },
  /* Fallback */
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  fallbackTitle: {
    color: "#05070A",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  fallbackSubtitle: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  fallbackButton: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#111827",
    marginTop: 8,
  },
  fallbackButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
});
