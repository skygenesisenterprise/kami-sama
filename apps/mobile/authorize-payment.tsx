import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { MobileTokens } from "@/constants/theme";
import {
  type PaymentAuthorization,
  type PaymentAuthorizationRiskLevel,
  type PaymentAuthorizationStatus,
} from "@/data/payment-authorizations";
import { usePaymentAuthorization } from "@/hooks/use-payment-authorization";
import { useTheme } from "@/hooks/use-theme";
import { authenticatePaymentAuthorization } from "@/services/local-authentication";

const challengeReasonLabels: Record<PaymentAuthorization["challengeReason"], string> = {
  online_payment: "Paiement en ligne",
  new_merchant: "Nouveau marchand",
  high_amount: "Montant eleve",
  unusual_activity: "Activite inhabituelle",
};

const riskLevelLabels: Record<PaymentAuthorizationRiskLevel, string> = {
  low: "Faible",
  normal: "Normal",
  high: "Eleve",
};

const statusLabels: Record<PaymentAuthorizationStatus, string> = {
  pending: "En attente",
  approved: "Approuve",
  declined: "Refuse",
  expired: "Expire",
  cancelled: "Annule",
};

const statusTones: Record<PaymentAuthorizationStatus, { background: string; color: string; icon: React.ComponentProps<typeof MaterialIcons>["name"] }> = {
  pending: { background: "#E8F1FF", color: "#1D4ED8", icon: "timelapse" },
  approved: { background: "#E9F8EF", color: "#166534", icon: "check-circle" },
  declined: { background: "#FDECEC", color: "#B91C1C", icon: "gpp-bad" },
  expired: { background: "#FFF3E1", color: "#B45309", icon: "hourglass-disabled" },
  cancelled: { background: "#EEF1F5", color: "#4B5563", icon: "cancel" },
};

function formatAmount(amountMinor: number, currency: PaymentAuthorization["currency"]) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

function formatRemainingTime(remainingSeconds: number) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function goHome() {
  router.replace("/home");
}

export default function AuthorizePaymentScreen() {
  const insets = usePhoneSafeAreaInsets();
  const theme = useTheme();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requestId = typeof params.requestId === "string" ? params.requestId : undefined;
  const {
    authorization,
    status,
    isLoading,
    approve,
    decline,
    markExpired,
    remainingSeconds,
  } = usePaymentAuthorization(requestId);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (status === "pending" && remainingSeconds === 0) {
      markExpired();
    }
  }, [markExpired, remainingSeconds, status]);

  const handleApprove = React.useCallback(async () => {
    if (!authorization || status !== "pending" || isSubmitting || remainingSeconds <= 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const authResult = await authenticatePaymentAuthorization();

      if (!authResult.success) {
        if (authResult.error) {
          Alert.alert("Verification interrompue", authResult.error);
        }

        return;
      }

      await approve();
    } finally {
      setIsSubmitting(false);
    }
  }, [approve, authorization, isSubmitting, remainingSeconds, status]);

  const handleDecline = React.useCallback(() => {
    if (!authorization || status !== "pending" || isSubmitting) {
      return;
    }

    Alert.alert(
      "Refuser ce paiement ?",
      "Si vous ne reconnaissez pas cette operation, le paiement sera refuse.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Refuser le paiement",
          style: "destructive",
          onPress: async () => {
            setIsSubmitting(true);

            try {
              await decline();
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  }, [authorization, decline, isSubmitting, status]);

  return (
    <ScreenTransition direction="up">
      <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + 8,
              paddingBottom: insets.bottom + 28,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Header onClose={goHome} />
          {isLoading ? (
            <LoadingState />
          ) : !requestId ? (
            <FallbackState
              icon="link-off"
              title="Demande introuvable"
              description="Aucun identifiant de verification n'a ete fourni."
            />
          ) : !authorization ? (
            <FallbackState
              icon="find-in-page"
              title="Demande inconnue"
              description="Cette demande de verification n'existe pas dans le prototype local."
            />
          ) : (
            <PaymentAuthorizationContent
              authorization={authorization}
              isSubmitting={isSubmitting}
              onApprove={handleApprove}
              onDecline={handleDecline}
              remainingSeconds={remainingSeconds}
            />
          )}
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Verification de paiement</Text>
        <Text style={styles.headerSubtitle}>
          Confirmez uniquement si vous etes a l'origine de cette operation
        </Text>
      </View>
      <Pressable accessibilityLabel="Fermer la verification de paiement" style={styles.closeButton} onPress={onClose}>
        <MaterialIcons name="close" size={22} color="#111827" />
      </Pressable>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.stateCard}>
      <ActivityIndicator size="small" color="#334A74" />
      <Text style={styles.stateTitle}>Chargement de la verification</Text>
      <Text style={styles.stateDescription}>Preparation de la demande d'autorisation locale.</Text>
    </View>
  );
}

function FallbackState({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  title: string;
}) {
  return (
    <View style={styles.stateCard}>
      <View style={styles.stateIconWrap}>
        <MaterialIcons name={icon} size={24} color="#111827" />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDescription}>{description}</Text>
      <Pressable accessibilityLabel="Retourner a l'accueil" style={styles.primaryButton} onPress={goHome}>
        <Text style={styles.primaryButtonText}>Retour a l'accueil</Text>
      </Pressable>
    </View>
  );
}

function PaymentAuthorizationContent({
  authorization,
  isSubmitting,
  onApprove,
  onDecline,
  remainingSeconds,
}: {
  authorization: PaymentAuthorization;
  isSubmitting: boolean;
  onApprove: () => Promise<void>;
  onDecline: () => void;
  remainingSeconds: number;
}) {
  const statusTone = statusTones[authorization.status];
  const isActionable = authorization.status === "pending" && remainingSeconds > 0;
  const amount = formatAmount(authorization.amountMinor, authorization.currency);

  return (
    <>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusTone.background }]}>
            <MaterialIcons name={statusTone.icon} size={14} color={statusTone.color} />
            <Text style={[styles.statusBadgeText, { color: statusTone.color }]}>
              {statusLabels[authorization.status]}
            </Text>
          </View>
          <View style={styles.prototypePill}>
            <Text style={styles.prototypePillText}>Prototype client</Text>
          </View>
        </View>
        <Text style={styles.amountLabel}>Montant a confirmer</Text>
        <Text style={styles.amountValue}>{amount}</Text>
        <Text style={styles.heroMerchant}>{authorization.merchantName}</Text>
        <Text style={styles.heroHelper}>
          La validation securise cette operation. Aucun paiement reel n'est traite dans ce prototype.
        </Text>
      </View>

      <SectionCard title="Marchand">
        <KeyValueRow label="Nom du marchand" value={authorization.merchantName} />
        <KeyValueRow label="Categorie" value={authorization.merchantCategory ?? "Non communiquee"} />
        <KeyValueRow label="Montant" value={amount} />
        <KeyValueRow label="Carte utilisee" value={`Carte ${authorization.cardLabel} •••• ${authorization.cardLast4}`} />
        <KeyValueRow label="Compte lie" value={`Compte : ${authorization.accountName}`} />
        {authorization.locationHint ? (
          <KeyValueRow label="Origine estimee" value={authorization.locationHint} />
        ) : null}
      </SectionCard>

      <SectionCard title="Securite">
        <KeyValueRow label="Raison" value={challengeReasonLabels[authorization.challengeReason]} />
        <KeyValueRow label="Risque" value={riskLevelLabels[authorization.riskLevel]} highlight={authorization.riskLevel === "high"} />
        <KeyValueRow label="Statut" value={statusLabels[authorization.status]} />
        <KeyValueRow
          label="Expire dans"
          value={authorization.status === "pending" ? formatRemainingTime(remainingSeconds) : "Termine"}
          highlight={authorization.status === "pending" && remainingSeconds <= 60}
        />
      </SectionCard>

      <StatusPanel authorization={authorization} remainingSeconds={remainingSeconds} />

      <View style={styles.actionCard}>
        {authorization.status === "pending" ? (
          <>
            <Pressable
              accessibilityLabel="Confirmer le paiement"
              disabled={!isActionable || isSubmitting}
              style={[
                styles.primaryButton,
                (!isActionable || isSubmitting) && styles.buttonDisabled,
              ]}
              onPress={() => {
                void onApprove();
              }}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Verification en cours..." : "Confirmer le paiement"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Je ne reconnais pas ce paiement"
              disabled={!isActionable || isSubmitting}
              style={[
                styles.dangerButton,
                (!isActionable || isSubmitting) && styles.buttonDisabled,
              ]}
              onPress={onDecline}
            >
              <Text style={styles.dangerButtonText}>Je ne reconnais pas ce paiement</Text>
            </Pressable>
          </>
        ) : (
          <Pressable accessibilityLabel="Retourner a l'accueil" style={styles.primaryButton} onPress={goHome}>
            <Text style={styles.primaryButtonText}>Retour a l'accueil</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

function StatusPanel({
  authorization,
  remainingSeconds,
}: {
  authorization: PaymentAuthorization;
  remainingSeconds: number;
}) {
  if (authorization.status === "approved") {
    return (
      <View style={[styles.feedbackCard, styles.feedbackSuccess]}>
        <MaterialIcons name="verified-user" size={22} color="#166534" />
        <Text style={styles.feedbackTitle}>Paiement confirme</Text>
        <Text style={styles.feedbackText}>
          La demande a ete approuvee localement. Le branchement futur SGE API pourra appeler `POST /v1/payment-authorizations/:requestId/approve`.
        </Text>
      </View>
    );
  }

  if (authorization.status === "declined") {
    return (
      <View style={[styles.feedbackCard, styles.feedbackDanger]}>
        <MaterialIcons name="shield" size={22} color="#B91C1C" />
        <Text style={styles.feedbackTitle}>Paiement refuse</Text>
        <Text style={styles.feedbackText}>
          L'operation a ete refusee. Dans une future version, la carte pourra etre securisee automatiquement et le refus sera envoye a `POST /v1/payment-authorizations/:requestId/decline`.
        </Text>
      </View>
    );
  }

  if (authorization.status === "expired") {
    return (
      <View style={[styles.feedbackCard, styles.feedbackWarning]}>
        <MaterialIcons name="schedule" size={22} color="#B45309" />
        <Text style={styles.feedbackTitle}>Demande expiree</Text>
        <Text style={styles.feedbackText}>
          Le paiement n'a pas ete confirme a temps. La fenetre de verification est fermee.
        </Text>
      </View>
    );
  }

  if (authorization.status === "cancelled") {
    return (
      <View style={[styles.feedbackCard, styles.feedbackMuted]}>
        <MaterialIcons name="cancel" size={22} color="#4B5563" />
        <Text style={styles.feedbackTitle}>Demande annulee</Text>
        <Text style={styles.feedbackText}>
          Cette verification a ete annulee avant validation.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.feedbackCard, styles.feedbackPending]}>
      <MaterialIcons name="lock-clock" size={22} color="#1D4ED8" />
      <Text style={styles.feedbackTitle}>Verification requise</Text>
      <Text style={styles.feedbackText}>
        Utilisez la confirmation securisee sur cet appareil. Temps restant : {formatRemainingTime(remainingSeconds)}.
      </Text>
    </View>
  );
}

function SectionCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionDivider} />
      {children}
    </View>
  );
}

function KeyValueRow({
  highlight,
  label,
  value,
}: {
  highlight?: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: "#05070A",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    marginBottom: 6,
  },
  headerSubtitle: {
    color: "#5B6577",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DCE1EA",
    backgroundColor: "#FFFFFF",
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE1EA",
    ...MobileTokens.shadow.floating,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  prototypePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#EEF1F5",
  },
  prototypePillText: {
    color: "#5B6577",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  amountLabel: {
    color: "#697386",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  amountValue: {
    color: "#05070A",
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    marginBottom: 10,
  },
  heroMerchant: {
    color: "#111827",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroHelper: {
    color: "#697386",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  sectionCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE1EA",
    ...MobileTokens.shadow.card,
  },
  sectionTitle: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 9,
  },
  rowLabel: {
    flex: 1,
    color: "#697386",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  rowValue: {
    flex: 1,
    color: "#111827",
    textAlign: "right",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  rowValueHighlight: {
    color: "#B45309",
  },
  feedbackCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 8,
  },
  feedbackPending: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  feedbackSuccess: {
    backgroundColor: "#ECFDF3",
    borderColor: "#A7F3D0",
  },
  feedbackDanger: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  feedbackWarning: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },
  feedbackMuted: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E5E7EB",
  },
  feedbackTitle: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  feedbackText: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  actionCard: {
    gap: 12,
    paddingTop: 2,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: MobileTokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#334A74",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  dangerButton: {
    minHeight: 54,
    borderRadius: MobileTokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3C2C2",
  },
  dangerButtonText: {
    color: "#B91C1C",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  stateCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE1EA",
    ...MobileTokens.shadow.card,
  },
  stateIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1F5",
  },
  stateTitle: {
    color: "#05070A",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  stateDescription: {
    color: "#697386",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
});
