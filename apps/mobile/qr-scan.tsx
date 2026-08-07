import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { AppState, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { BarcodeScanningResult } from "expo-camera/build/Camera.types";
import CameraView from "expo-camera/build/CameraView";
import CameraManager from "expo-camera/build/ExpoCameraManager";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { type Account, accounts } from "@/data/accounts";
import { parseQrPaymentPayload } from "@/services/qr-payment";

interface CameraPermissionResponse {
  granted: boolean;
  status: string;
  canAskAgain: boolean;
  expires: string;
}

interface QrAccountContent {
  title: string;
  subtitle: string;
  qrHint: string;
  preparedMessage: string;
}

const qrAccountContent: Record<string, QrAccountContent> = {
  "aether-salary": {
    title: "Scanner un QR code",
    subtitle: "Scannez un QR code marchand pour preparer un paiement depuis votre compte personnel Aether.",
    qrHint: "QR marchand, demande de paiement ou reference compatible SEPA / Aether Pay pour vos depenses personnelles.",
    preparedMessage: "Paiement personnel prepare. Le debit sera rattache a vos depenses du quotidien.",
  },
  joint: {
    title: "Scanner pour le compte joint",
    subtitle: "Scannez un QR code de foyer ou de depense partagee depuis votre compte joint.",
    qrHint: "QR marchand foyer, depense partagee ou appel de fonds compatible SEPA / Aether Pay.",
    preparedMessage: "Paiement du foyer prepare. Cette operation sera rattachee au budget commun.",
  },
  epargne: {
    title: "Scanner depuis l'epargne",
    subtitle: "Scannez un QR code de transfert ou d'investissement depuis votre espace epargne.",
    qrHint: "QR de transfert interne, depot d'investissement ou reference compatible epargne / Aether Pay.",
    preparedMessage: "Operation d'epargne preparee. Le mouvement sera traite comme allocation ou investissement.",
  },
  "sge-operations": {
    title: "Scanner un QR pro",
    subtitle: "Scannez un QR code fournisseur ou marchand depuis votre compte professionnel SGE.",
    qrHint: "QR fournisseur, note de frais, encaissement ou demande de paiement B2B compatible SEPA / Aether Pay.",
    preparedMessage: "Paiement professionnel prepare. Cette operation sera rattachee a la tresorerie SGE.",
  },
};

export default function QrScanScreen() {
  const insets = usePhoneSafeAreaInsets();
  const pathname = usePathname();
  const params = useLocalSearchParams<{ accountId?: string }>();
  const [permission, setPermission] = React.useState<CameraPermissionResponse | null>(null);
  const [isScanEnabled, setIsScanEnabled] = React.useState(true);
  const [scannedValue, setScannedValue] = React.useState<string | null>(null);
  const [appState, setAppState] = React.useState(AppState.currentState);

  React.useEffect(() => {
    let isMounted = true;

    void CameraManager.getCameraPermissionsAsync()
      .then((nextPermission) => {
        if (isMounted) {
          setPermission(nextPermission);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPermission(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleRetry = React.useCallback(() => {
    setScannedValue(null);
    setIsScanEnabled(true);
  }, []);

  const handleRequestPermission = React.useCallback(async () => {
    const nextPermission = await CameraManager.requestCameraPermissionsAsync();
    setPermission(nextPermission);
  }, []);

  const handleClose = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.push("/home");
  }, []);

  const selectedAccount = React.useMemo<Account | undefined>(() => {
    const selectedAccountId = typeof params.accountId === "string" ? params.accountId : undefined;
    return accounts.find((account) => account.id === selectedAccountId) ?? accounts[0];
  }, [params.accountId]);
  const selectedAccountContent = React.useMemo<QrAccountContent>(() => {
    if (!selectedAccount) {
      return qrAccountContent["aether-salary"];
    }

    return qrAccountContent[selectedAccount.id] ?? qrAccountContent["aether-salary"];
  }, [selectedAccount]);
  const isCameraActive = pathname === "/qr-scan" && appState === "active";

  const handleScan = React.useCallback((result: BarcodeScanningResult) => {
    if (!isScanEnabled) {
      return;
    }

    setIsScanEnabled(false);
    setScannedValue(result.data);

    const parsedPayment = parseQrPaymentPayload(result.data);

    router.push({
      pathname: "/qr-scan-confirm",
      params: {
        accountId: selectedAccount?.id,
        merchantName: parsedPayment.merchantName,
        merchantCity: parsedPayment.merchantCity,
        amountMinor: String(parsedPayment.amountMinor),
        currency: parsedPayment.currency,
        label: parsedPayment.label,
        reference: parsedPayment.reference,
      },
    });
  }, [isScanEnabled, selectedAccount?.id]);

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable style={styles.headerButton} onPress={handleClose}>
              <MaterialIcons name="arrow-back" size={20} color="#111827" />
            </Pressable>
            <Text style={styles.headerTitle}>Paiement QR</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.pageTitle}>{selectedAccountContent.title}</Text>
          <Text style={styles.pageSubtitle}>
            {selectedAccountContent.subtitle}
          </Text>

          <View style={styles.cameraCard}>
            {Platform.OS === "web" ? (
              <View style={styles.cameraFallback}>
                <MaterialIcons name="qr-code-scanner" size={34} color="#111827" />
                <Text style={styles.cameraFallbackTitle}>Scanner indisponible sur le web</Text>
                <Text style={styles.cameraFallbackText}>
                  Ouvrez l'application sur iPhone ou Android pour utiliser la camera.
                </Text>
              </View>
            ) : permission?.granted ? (
              <View style={styles.cameraFrame}>
                <CameraView
                  style={styles.camera}
                  active={isCameraActive}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={isScanEnabled && isCameraActive ? handleScan : undefined}
                />
                <View style={styles.scanOverlay} pointerEvents="none">
                  <View style={styles.scanTarget} />
                </View>
              </View>
            ) : (
              <View style={styles.cameraFallback}>
                <MaterialIcons name="camera-alt" size={34} color="#111827" />
                <Text style={styles.cameraFallbackTitle}>Autorisation camera requise</Text>
                <Text style={styles.cameraFallbackText}>
                  Autorisez l'acces camera pour scanner un QR code de paiement.
                </Text>
                <Pressable style={styles.primaryButton} onPress={() => void handleRequestPermission()}>
                  <Text style={styles.primaryButtonText}>Autoriser la camera</Text>
                </Pressable>
              </View>
            )}
          </View>

          {scannedValue ? (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <MaterialIcons name="check-circle" size={18} color="#166534" />
                <Text style={styles.resultTitle}>QR detecte</Text>
              </View>
              <Text style={styles.resultValue} numberOfLines={4}>
                {scannedValue}
              </Text>
              <Text style={styles.resultDescription}>
                {selectedAccountContent.preparedMessage} TODO: connecter le parseur du QR code puis l'ecran de confirmation de paiement.
              </Text>
              <View style={styles.resultActions}>
                <Pressable style={styles.secondaryButton} onPress={handleRetry}>
                  <Text style={styles.secondaryButtonText}>Scanner a nouveau</Text>
                </Pressable>
                <Pressable style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Continuer</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <MaterialIcons name="tips-and-updates" size={18} color="#B45309" />
              <Text style={styles.tipTitle}>Conseil</Text>
            </View>
            <Text style={styles.tipText}>
              Centrez le QR code dans le cadre et gardez le telephone stable pendant une seconde pour un scan plus rapide.
            </Text>
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
  },
  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  pageTitle: {
    color: "#05070A",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    marginTop: 18,
  },
  pageSubtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    marginTop: 10,
  },
  cameraCard: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  cameraFrame: {
    position: "relative",
    height: 380,
    backgroundColor: "#05070A",
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5, 7, 10, 0.18)",
  },
  scanTarget: {
    width: 220,
    height: 220,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
  },
  cameraFallback: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
  },
  cameraFallbackTitle: {
    color: "#05070A",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center",
  },
  cameraFallbackText: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  resultCard: {
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    backgroundColor: "#F0FDF4",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultTitle: {
    color: "#166534",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  resultValue: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: 10,
  },
  resultDescription: {
    color: "#166534",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 10,
  },
  resultActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  tipCard: {
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    backgroundColor: "#FFFBEA",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipTitle: {
    color: "#92400E",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  tipText: {
    color: "#B45309",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: "#111827",
    marginTop: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    marginTop: 16,
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
});
