import * as React from "react";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Animated, Easing, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { getPortfolioCard, portfolioCards } from "@/data/cards";

type ActionIcon = React.ComponentProps<typeof MaterialIcons>["name"];

function hashCardSeed(input: string) {
  return input.split("").reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) % 1000003;
  }, 17);
}

function buildCardNumber(seed: number, last4: string) {
  const groups = Array.from({ length: 3 }, (_, index) => {
    const value = ((seed + index * 137) % 9000) + 1000;
    return String(value);
  });
  return [...groups, last4].join(" ");
}

function buildExpiry(seed: number) {
  const month = ((seed % 12) + 1).toString().padStart(2, "0");
  const year = ((seed % 5) + 27).toString().padStart(2, "0");
  return `${month}/${year}`;
}

function buildCvc(seed: number) {
  return String((seed % 900) + 100);
}

export default function CardsDetailScreen() {
  const insets = usePhoneSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const rawId = Array.isArray(id) ? id[0] : id;
  const decodedId = rawId ? decodeURIComponent(rawId) : "";
  const card = getPortfolioCard(decodedId) ?? portfolioCards[0];
  const [showSensitiveDetails, setShowSensitiveDetails] = React.useState(false);
  const revealProgress = React.useRef(new Animated.Value(0)).current;
  const cardSeed = React.useMemo(() => hashCardSeed(`${card.id}:${card.last4}:${card.currency}`), [card.currency, card.id, card.last4]);
  const cardNumber = React.useMemo(() => buildCardNumber(cardSeed, card.last4), [card.last4, cardSeed]);
  const expiry = React.useMemo(() => buildExpiry(cardSeed), [cardSeed]);
  const cvc = React.useMemo(() => buildCvc(cardSeed), [cardSeed]);
  const isWalletEligible = card.subtitle === "Prête à l'emploi";
  const shouldHideRecentActivity = card.subtitle === "Prête à l'emploi";
  const walletBranding = React.useMemo(() => {
    if (Platform.OS === "ios") {
      return {
        title: "Ajouter à Apple Wallet",
        subtitle: "Disponible immédiatement dans Apple Pay.",
        scheme: "shoebox://",
        fallback: "https://support.apple.com/wallet",
      };
    }

    return {
      title: "Ajouter à Google Wallet",
      subtitle: "Disponible immédiatement dans Google Pay.",
      scheme: "intent://wallet.google/#Intent;scheme=https;package=com.google.android.apps.walletnfcrel;end",
      fallback: "https://wallet.google/",
    };
  }, []);

  const showCardInfo = React.useCallback((visible: boolean) => {
    Animated.timing(revealProgress, {
      toValue: visible ? 1 : 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealProgress]);

  const handleActionPress = React.useCallback((action: (typeof card.actions)[number]) => {
    if (action.id === "details") {
      setShowSensitiveDetails((prev) => {
        const next = !prev;
        showCardInfo(next);
        return next;
      });
      return;
    }

    if (action.id === "settings") {
      router.push({
        pathname: "/cards-detail-settings",
        params: { id: card.id },
      });
      return;
    }

    Alert.alert(action.label, "Action simulée pour le moment.");
  }, [card.id, showCardInfo]);

  const handleWalletPress = React.useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL(walletBranding.scheme);
      if (supported) {
        await Linking.openURL(walletBranding.scheme);
        return;
      }
    } catch {
      // Fall through to web fallback when the native scheme is unavailable.
    }

    try {
      await Linking.openURL(walletBranding.fallback);
    } catch {
      Alert.alert("Wallet indisponible", "Impossible d'ouvrir le wallet sur cet appareil.");
    }
  }, [walletBranding.fallback, walletBranding.scheme]);

  const maskedOpacity = revealProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const maskedScale = revealProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.96],
  });

  const revealedOpacity = revealProgress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0, 0.18, 1],
  });

  const revealedTranslateY = revealProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const revealedScale = revealProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable style={styles.headerButton} onPress={() => router.replace("/cards")}>
              <MaterialIcons name="arrow-back" size={20} color="#111827" />
            </Pressable>
            <Pressable style={styles.headerButton} onPress={() => Alert.alert("Aide", "Options de carte bientôt disponibles.")}>
              <MaterialIcons name="help-outline" size={20} color="#111827" />
            </Pressable>
          </View>

          <View style={styles.cardSurface}>
            <View style={styles.cardArtwork}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.cardArtworkFace,
                  {
                    opacity: maskedOpacity,
                    transform: [{ scale: maskedScale }],
                  },
                ]}
              >
                <View style={styles.cardArtworkSheen} />
                <View style={[styles.cardArtworkWave, styles.cardArtworkWaveOne]} />
                <View style={[styles.cardArtworkWave, styles.cardArtworkWaveTwo]} />
                <View style={[styles.cardArtworkWave, styles.cardArtworkWaveThree]} />
                <View style={[styles.cardArtworkWave, styles.cardArtworkWaveFour]} />

                <View style={styles.cardArtworkHeader}>
                  <Text style={styles.cardArtworkBrand}>SKY GENESIS ENTERPRISE</Text>
                  {card.currency ? (
                    <View style={styles.currencyPill}>
                      <MaterialIcons name="link" size={13} color="#D4D4D8" />
                      <Text style={styles.currencyPillText}>{card.currency}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.cardHardwareRow}>
                  <View style={styles.cardArtworkChip}>
                    <View style={styles.cardArtworkChipCore} />
                    <View style={styles.cardArtworkChipLineTop} />
                    <View style={styles.cardArtworkChipLineBottom} />
                  </View>
                  <MaterialIcons name="contactless" size={34} color="#B8B8B8" />
                </View>

                <View style={styles.cardArtworkFooter}>
                  <View style={styles.cardNetworkBlock}>
                    {card.network === "visa" ? (
                      <Text style={styles.cardArtworkVisa}>VISA</Text>
                    ) : card.network === "mastercard" ? (
                      <View style={styles.mastercardGlyph}>
                        <View style={[styles.mastercardCircle, styles.mastercardCircleLeft]} />
                        <View style={[styles.mastercardCircle, styles.mastercardCircleRight]} />
                      </View>
                    ) : (
                      <Text style={styles.cardArtworkVisa}>RPay</Text>
                    )}
                    <Text style={styles.cardNetworkLabel}>{card.network === "visa" ? "visa" : card.network === "mastercard" ? "mastercard" : "pay"}</Text>
                  </View>
                </View>

                <Text style={styles.cardArtworkLast4}>•• {card.last4}</Text>
              </Animated.View>

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.cardArtworkFace,
                  styles.cardArtworkDetailsFace,
                  {
                    opacity: revealedOpacity,
                    transform: [{ translateY: revealedTranslateY }, { scale: revealedScale }],
                  },
                ]}
              >
                <View style={styles.cardDetailsTopRow}>
                  <View>
                    <Text style={styles.cardDetailsLabel}>Card Holder</Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.82}
                      style={styles.cardDetailsValue}
                    >
                      {card.title.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardDetailsCurrencyPill}>
                    <MaterialIcons name="verified-user" size={14} color="#111827" />
                    <Text style={styles.cardDetailsCurrencyText}>{card.currency || "GLOBAL"}</Text>
                  </View>
                </View>

                <View style={styles.cardDetailsBody}>
                  <View style={styles.cardDetailsChipRow}>
                    <View style={styles.cardDetailsChip}>
                      <View style={styles.cardDetailsChipCore} />
                    </View>
                    <MaterialIcons name="contactless" size={30} color="#111827" />
                  </View>

                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.76}
                    style={styles.cardDetailsNumber}
                  >
                    {cardNumber}
                  </Text>

                  <View style={styles.cardDetailsMetaRow}>
                    <View>
                      <Text style={styles.cardDetailsLabel}>Expiry</Text>
                      <Text style={styles.cardDetailsMetaValue}>{expiry}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardDetailsLabel}>CVC</Text>
                      <Text style={styles.cardDetailsMetaValue}>{cvc}</Text>
                    </View>
                    <View style={styles.cardDetailsNetworkBlock}>
                      {card.network === "visa" ? (
                        <Text style={styles.cardDetailsVisa}>VISA</Text>
                      ) : card.network === "mastercard" ? (
                        <View style={styles.mastercardGlyph}>
                          <View style={[styles.mastercardCircle, styles.mastercardCircleLeft]} />
                          <View style={[styles.mastercardCircle, styles.mastercardCircleRight]} />
                        </View>
                      ) : (
                        <Text style={styles.cardDetailsVisa}>RPay</Text>
                      )}
                    </View>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>

          <View style={styles.detailsPanel}>
            <View style={styles.actionsCard}>
              <View style={styles.actionsHandle} />
              {card.actions.map((action, index) => (
                <React.Fragment key={action.id}>
                  <Pressable
                    style={styles.actionItem}
                    onPress={() => handleActionPress(action)}
                  >
                    <View style={styles.actionIcon}>
                      <MaterialIcons name={action.icon as ActionIcon} size={20} color="#111827" />
                    </View>
                    <Text style={styles.actionText}>
                      {action.id === "details"
                        ? showSensitiveDetails
                          ? "Masquer les informations"
                          : "Afficher les informations"
                        : action.label}
                    </Text>
                  </Pressable>
                  {index < card.actions.length - 1 ? <View style={styles.actionDivider} /> : null}
                </React.Fragment>
              ))}
            </View>

            {isWalletEligible ? (
              <Pressable
                style={styles.walletCta}
                onPress={handleWalletPress}
              >
                <View style={styles.walletCtaIcon}>
                  {Platform.OS === "ios" ? (
                    <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="logo-android" size={20} color="#FFFFFF" />
                  )}
                </View>
                <View style={styles.walletCtaCopy}>
                  <Text style={styles.walletCtaTitle}>{walletBranding.title}</Text>
                  <Text style={styles.walletCtaSubtitle}>{walletBranding.subtitle}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </Pressable>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Activité récente</Text>
              {!shouldHideRecentActivity ? (
                <Pressable onPress={() => router.push("/transactions")}>
                  <Text style={styles.sectionAction}>Tout afficher</Text>
                </Pressable>
              ) : null}
            </View>

            {shouldHideRecentActivity ? (
              <View style={styles.emptyActivityCard}>
                <View style={styles.emptyActivityIcon}>
                  <MaterialIcons name="schedule" size={18} color="#6B7280" />
                </View>
                <Text style={styles.emptyActivityTitle}>Aucune activité récente</Text>
                <Text style={styles.emptyActivitySubtitle}>
                  Cette carte est prête à l'emploi et n'a pas encore ete utilisee.
                </Text>
              </View>
            ) : (
              card.activity.map((item, index) => (
                <View key={item.id} style={[styles.activityRow, index < card.activity.length - 1 && styles.activityRowBorder]}>
                  <View style={styles.activityLeading}>
                    <View style={styles.activityAvatar}>
                      <Text style={styles.activityAvatarText}>{item.iconLabel}</Text>
                      <View style={styles.activityErrorDot}>
                        <MaterialIcons name="close" size={8} color="#FFFFFF" />
                      </View>
                    </View>
                    <View style={styles.activityCopy}>
                      <Text style={styles.activityMerchant}>{item.merchant}</Text>
                      <Text style={styles.activityMeta}>{item.date} · {item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.activityAmount}>{item.amount}</Text>
                </View>
              ))
            )}
          </View>
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
    marginBottom: 18,
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
  cardSurface: {
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  cardArtwork: {
    height: 214,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#3F3F46",
    overflow: "hidden",
    backgroundColor: "#0B0B0B",
  },
  cardArtworkFace: {
    ...StyleSheet.absoluteFillObject,
    padding: 18,
    justifyContent: "space-between",
  },
  cardArtworkSheen: {
    position: "absolute",
    top: -36,
    right: -34,
    width: 188,
    height: 292,
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "24deg" }],
  },
  cardArtworkWave: {
    position: "absolute",
    right: -46,
    width: 260,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    transform: [{ rotate: "-16deg" }],
  },
  cardArtworkWaveOne: {
    top: 54,
  },
  cardArtworkWaveTwo: {
    top: 76,
    opacity: 0.82,
  },
  cardArtworkWaveThree: {
    top: 98,
    opacity: 0.58,
  },
  cardArtworkWaveFour: {
    top: 120,
    opacity: 0.38,
  },
  cardArtworkHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardArtworkBrand: {
    maxWidth: "52%",
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  cardHardwareRow: {
    position: "absolute",
    left: 28,
    top: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },
  cardArtworkChip: {
    width: 48,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#8C8C8C",
    borderRadius: 8,
    backgroundColor: "#BDBDBD",
  },
  cardArtworkChipCore: {
    width: 18,
    height: 24,
    borderWidth: 1,
    borderColor: "#7A7A7A",
    borderRadius: 6,
  },
  cardArtworkChipLineTop: {
    position: "absolute",
    top: 12,
    right: 0,
    left: 0,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.34)",
  },
  cardArtworkChipLineBottom: {
    position: "absolute",
    right: 0,
    bottom: 12,
    left: 0,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.24)",
  },
  cardArtworkFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  cardArtworkLast4: {
    position: "absolute",
    left: 20,
    bottom: 20,
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  cardArtworkDetailsFace: {
    backgroundColor: "#F3F4F6",
  },
  currencyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  currencyPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "900",
  },
  cardNetworkBlock: {
    alignItems: "center",
    minWidth: 70,
  },
  cardArtworkVisa: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "900",
  },
  cardNetworkLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
    marginTop: 2,
  },
  mastercardGlyph: {
    width: 48,
    height: 28,
  },
  mastercardCircle: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  mastercardCircleLeft: {
    left: 0,
    backgroundColor: "#EF4444",
  },
  mastercardCircleRight: {
    right: 0,
    backgroundColor: "#F59E0B",
    opacity: 0.95,
  },
  cardDetailsTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardDetailsCurrencyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#E5E7EB",
  },
  cardDetailsCurrencyText: {
    color: "#111827",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  cardDetailsBody: {
    marginTop: 10,
  },
  cardDetailsChipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  cardDetailsChip: {
    width: 52,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BDBDBD",
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  cardDetailsChipCore: {
    width: 18,
    height: 22,
    borderWidth: 1,
    borderColor: "#A1A1AA",
    borderRadius: 6,
  },
  cardDetailsLabel: {
    color: "#6B7280",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cardDetailsValue: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
    marginTop: 4,
    maxWidth: 146,
  },
  cardDetailsNumber: {
    color: "#111827",
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: 1.1,
    fontVariant: ["tabular-nums"],
  },
  cardDetailsMetaRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 18,
  },
  cardDetailsMetaValue: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 17,
    fontWeight: "900",
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  cardDetailsNetworkBlock: {
    alignItems: "flex-end",
    minWidth: 70,
  },
  cardDetailsVisa: {
    color: "#111827",
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "900",
  },
  cardRevealHint: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },
  detailsPanel: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  actionsCard: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingBottom: 18,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  actionsHandle: {
    position: "absolute",
    top: -20,
    left: "50%",
    width: 44,
    height: 5,
    marginLeft: -22,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
  },
  actionItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  actionDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  actionIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  actionText: {
    color: "#111827",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  walletCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#F3F4F6",
  },
  walletCtaIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#111827",
  },
  walletCtaCopy: {
    flex: 1,
    minWidth: 0,
  },
  walletCtaTitle: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  walletCtaSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
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
  emptyActivityCard: {
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 22,
    backgroundColor: "#F9FAFB",
  },
  emptyActivityIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
  },
  emptyActivityTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  emptyActivitySubtitle: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
  },
  activityRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  activityLeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityAvatar: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  activityAvatarText: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
  },
  activityErrorDot: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  activityCopy: {
    flex: 1,
  },
  activityMerchant: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  activityMeta: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 1,
  },
  activityAmount: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    textDecorationLine: "line-through",
  },
});
