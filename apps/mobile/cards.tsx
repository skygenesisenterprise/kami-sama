import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { type PortfolioCardItem, portfolioCards } from "@/data/cards";

const nearbyAtmCoordinates = {
  latitude: 43.4862,
  longitude: 5.2331,
};

function getExpoMaps() {
  if (Constants.appOwnership === "expo") {
    return null;
  }

  try {
    return require("expo-maps") as typeof import("expo-maps");
  } catch {
    return null;
  }
}

function isLightHexColor(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return false;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 186;
}

export default function CardsScreen() {
  const insets = usePhoneSafeAreaInsets();

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 36 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Header />
          <WalletSection />
          <NearbyAtmCard />
          <FooterCta />
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function Header() {
  return (
    <View style={styles.headerBlock}>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <MaterialIcons name="close" size={22} color="#111827" />
      </Pressable>
      <Text style={styles.pageTitle}>Portefeuille</Text>
    </View>
  );
}

function WalletSection() {
  return (
    <View style={styles.walletCard}>
      {portfolioCards.map((card, index) => (
        <WalletRow key={card.id} card={card} isLast={index === portfolioCards.length - 1} />
      ))}
    </View>
  );
}

function WalletRow({ card, isLast }: { card: PortfolioCardItem; isLast: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: "#E5E7EB" }}
      onPress={() => {
        router.push({
          pathname: "/cards-detail",
          params: { id: card.id },
        });
      }}
      style={({ pressed }) => [
        styles.walletRow,
        !isLast && styles.walletRowSpacing,
        pressed && styles.walletRowPressed,
      ]}
    >
      <CardPreview card={card} />
      <View style={styles.walletCopy}>
        <Text style={styles.walletTitle}>{card.title}</Text>
        <Text
          numberOfLines={card.compact ? 2 : 1}
          style={[styles.walletSubtitle, card.compact && styles.walletSubtitleCompact]}
        >
          {card.subtitle}
        </Text>
      </View>

      {card.currency ? (
        <View style={styles.currencyBadge}>
          <MaterialIcons name="link" size={12} color="#6B7280" />
          <Text style={styles.currencyBadgeText}>{card.currency}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function CardPreview({ card }: { card: PortfolioCardItem }) {
  const isLightCard = isLightHexColor(card.colors[0]);
  const foregroundColor = isLightCard ? "#111827" : "#FFFFFF";
  const mutedForegroundColor = isLightCard ? "rgba(17,24,39,0.68)" : "rgba(255,255,255,0.74)";
  const lineColor = isLightCard ? "rgba(17,24,39,0.12)" : "rgba(255,255,255,0.16)";
  const sheenColor = isLightCard ? "rgba(255,255,255,0.46)" : "rgba(255,255,255,0.1)";

  return (
    <View style={[styles.cardPreview, { backgroundColor: card.colors[0], borderColor: isLightCard ? "#D1D5DB" : "#3F3F46" }]}>
      <View style={[styles.cardPreviewOrb, { backgroundColor: card.colors[1] }]} />
      <View style={[styles.cardPreviewSheen, { backgroundColor: sheenColor }]} />
      <View style={[styles.cardPreviewLine, styles.cardPreviewLineOne, { backgroundColor: lineColor }]} />
      <View style={[styles.cardPreviewLine, styles.cardPreviewLineTwo, { backgroundColor: lineColor }]} />
      <View style={[styles.cardPreviewLine, styles.cardPreviewLineThree, { backgroundColor: lineColor }]} />

      <Text style={[styles.cardPreviewBrand, { color: foregroundColor }]}>SGE</Text>
      <View style={[styles.cardPreviewChip, { backgroundColor: isLightCard ? "rgba(17,24,39,0.12)" : "rgba(255,255,255,0.72)" }]}>
        <View style={styles.cardPreviewChipCore} />
      </View>
      <MaterialIcons name="contactless" size={10} color={mutedForegroundColor} style={styles.cardPreviewContactless} />
      <Text style={[styles.cardPreviewDigits, { color: foregroundColor }]}>•• {card.last4}</Text>

      {card.network === "visa" ? <Text style={[styles.visaGlyph, { color: foregroundColor }]}>VISA</Text> : null}

      {card.network === "mastercard" ? (
        <View style={styles.mastercardGlyph}>
          <View style={[styles.mastercardCircle, styles.mastercardCircleLeft]} />
          <View style={[styles.mastercardCircle, styles.mastercardCircleRight]} />
        </View>
      ) : null}

      {!card.network ? <Text style={[styles.rpayGlyph, { color: foregroundColor }]}>RPay</Text> : null}
    </View>
  );
}

function NearbyAtmCard() {
  return (
    <Pressable style={styles.atmCard}>
      <NearbyAtmMap />
      <View style={styles.atmOverlay} />
      <View style={styles.atmFooter}>
        <Text style={styles.atmTitle}>Trouver des DAB à proximité</Text>
        <MaterialIcons name="chevron-right" size={22} color="#111827" />
      </View>
    </Pressable>
  );
}

function NearbyAtmMap() {
  if (Platform.OS === "android") {
    const mapsModule = getExpoMaps();
    if (!mapsModule?.GoogleMaps) {
      return <NearbyAtmMapFallback />;
    }

    const { GoogleMaps } = mapsModule;

    return (
      <GoogleMaps.View
        style={styles.mapSurface}
        cameraPosition={{
          coordinates: nearbyAtmCoordinates,
          zoom: 13.8,
        }}
        colorScheme={GoogleMaps.MapColorScheme.LIGHT}
        markers={[
          {
            id: "nearby-atm",
            coordinates: nearbyAtmCoordinates,
            title: "Distributeur Aether",
            snippet: "Rognac",
            showCallout: true,
          },
        ]}
        properties={{
          mapType: GoogleMaps.MapType.NORMAL,
        }}
        uiSettings={{
          compassEnabled: false,
          indoorLevelPickerEnabled: false,
          mapToolbarEnabled: false,
          myLocationButtonEnabled: false,
          rotationGesturesEnabled: false,
          scrollGesturesEnabled: false,
          tiltGesturesEnabled: false,
          zoomControlsEnabled: false,
          zoomGesturesEnabled: false,
        }}
      />
    );
  }

  if (Platform.OS === "ios") {
    const mapsModule = getExpoMaps();
    if (!mapsModule?.AppleMaps) {
      return <NearbyAtmMapFallback />;
    }

    const { AppleMaps } = mapsModule;

    return (
      <AppleMaps.View
        style={styles.mapSurface}
        cameraPosition={{
          coordinates: nearbyAtmCoordinates,
          zoom: 0.12,
        }}
        colorScheme={AppleMaps.MapColorScheme.LIGHT}
        markers={[
          {
            id: "nearby-atm",
            coordinates: nearbyAtmCoordinates,
            title: "Distributeur Aether",
            tintColor: "#111827",
            systemImage: "building.columns.fill",
          },
        ]}
        properties={{
          mapType: AppleMaps.MapType.STANDARD,
        }}
        uiSettings={{
          compassEnabled: false,
          myLocationButtonEnabled: false,
          scaleBarEnabled: false,
          togglePitchEnabled: false,
        }}
      />
    );
  }

  return <NearbyAtmMapFallback />;
}

function NearbyAtmMapFallback() {
  return (
    <View style={styles.mapSurface}>
      <View style={styles.mapBackground} />
      <View style={styles.mapRoadPrimary} />
      <View style={styles.mapRoadSecondary} />
      <View style={styles.mapRoadVertical} />
      <View style={styles.mapRoutePill}>
        <Text style={styles.mapRoutePillText}>E46</Text>
      </View>
      <Text style={styles.mapAreaLabel}>Rognac</Text>
      <View style={styles.mapPin}>
        <MaterialIcons name="account-balance" size={18} color="#FFFFFF" />
      </View>
    </View>
  );
}

function FooterCta() {
  return (
    <View style={styles.footerBlock}>
      <Text style={styles.footerHint}>Vous souhaitez remplacer une carte résiliée ?</Text>
      <Pressable style={styles.addButton} onPress={() => router.push("/cards-create")}>
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Ajouter</Text>
      </Pressable>
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
  },
  walletCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 46,
  },
  walletRowPressed: {
    opacity: 0.72,
  },
  walletRowSpacing: {
    marginBottom: 8,
  },
  cardPreview: {
    width: 50,
    height: 30,
    borderWidth: 1,
    borderRadius: 7,
    marginRight: 9,
    overflow: "hidden",
    flexShrink: 0,
  },
  cardPreviewOrb: {
    position: "absolute",
    top: -8,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.92,
  },
  cardPreviewSheen: {
    position: "absolute",
    bottom: -4,
    left: 14,
    width: 28,
    height: 16,
    borderRadius: 12,
    transform: [{ rotate: "-12deg" }],
  },
  cardPreviewLine: {
    position: "absolute",
    right: -8,
    width: 42,
    height: 1,
    transform: [{ rotate: "-18deg" }],
  },
  cardPreviewLineOne: {
    top: 8,
  },
  cardPreviewLineTwo: {
    top: 13,
    opacity: 0.8,
  },
  cardPreviewLineThree: {
    top: 18,
    opacity: 0.5,
  },
  cardPreviewBrand: {
    position: "absolute",
    top: 4,
    left: 5,
    fontSize: 4,
    lineHeight: 5,
    fontWeight: "900",
    letterSpacing: 0.55,
  },
  cardPreviewChip: {
    position: "absolute",
    left: 5,
    top: 12,
    width: 10,
    height: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
  },
  cardPreviewChipCore: {
    width: 4,
    height: 4,
    borderRadius: 1.5,
    borderWidth: 1,
    borderColor: "rgba(113,113,122,0.5)",
  },
  cardPreviewContactless: {
    position: "absolute",
    left: 18,
    top: 11,
  },
  cardPreviewDigits: {
    position: "absolute",
    left: 5,
    bottom: 4,
    fontSize: 4,
    lineHeight: 5,
    fontWeight: "900",
    letterSpacing: 0.1,
    fontVariant: ["tabular-nums"],
  },
  mastercardGlyph: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 14,
    height: 8,
  },
  mastercardCircle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mastercardCircleLeft: {
    left: 0,
    backgroundColor: "#F59E0B",
  },
  mastercardCircleRight: {
    right: 0,
    backgroundColor: "#EF4444",
    opacity: 0.95,
  },
  visaGlyph: {
    position: "absolute",
    right: 4,
    bottom: 4,
    color: "#FFFFFF",
    fontSize: 6,
    lineHeight: 7,
    fontWeight: "900",
  },
  rpayGlyph: {
    position: "absolute",
    right: 4,
    bottom: 4,
    color: "#FFFFFF",
    fontSize: 5,
    lineHeight: 6,
    fontWeight: "900",
  },
  walletCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  walletTitle: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  walletSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 1,
  },
  walletSubtitleCompact: {
    maxWidth: 230,
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  currencyBadgeText: {
    color: "#374151",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "800",
  },
  atmCard: {
    height: 176,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 18,
    backgroundColor: "#E9EEF5",
  },
  mapSurface: {
    flex: 1,
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E6EDF6",
  },
  mapRoadPrimary: {
    position: "absolute",
    top: 40,
    left: -20,
    width: 430,
    height: 4,
    backgroundColor: "#A7F3D0",
    transform: [{ rotate: "-8deg" }],
    opacity: 0.95,
  },
  mapRoadSecondary: {
    position: "absolute",
    bottom: 62,
    left: -10,
    width: 300,
    height: 3,
    backgroundColor: "#93C5FD",
    transform: [{ rotate: "10deg" }],
    opacity: 0.8,
  },
  mapRoadVertical: {
    position: "absolute",
    top: 18,
    right: 92,
    width: 3,
    height: 120,
    backgroundColor: "#93C5FD",
    transform: [{ rotate: "18deg" }],
    opacity: 0.7,
  },
  mapRoutePill: {
    position: "absolute",
    top: 13,
    right: 18,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#22C55E",
  },
  mapRoutePillText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
  },
  mapAreaLabel: {
    position: "absolute",
    top: 22,
    left: 76,
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
  },
  mapPin: {
    position: "absolute",
    top: 66,
    left: "46%",
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#111827",
  },
  atmOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  atmFooter: {
    position: "absolute",
    right: 16,
    bottom: 14,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  atmTitle: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  footerBlock: {
    alignItems: "center",
  },
  footerHint: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minWidth: 132,
    height: 52,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 26,
    backgroundColor: "#111827",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "800",
  },
});
