import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { AppState, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { BarcodeScanningResult } from "expo-camera/build/Camera.types";
import CameraView from "expo-camera/build/CameraView";
import CameraManager from "expo-camera/build/ExpoCameraManager";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

interface CameraPermissionResponse {
  granted: boolean;
  status: string;
  canAskAgain: boolean;
  expires: string;
}

export default function CardsPartnerScanScreen() {
  const insets = usePhoneSafeAreaInsets();
  const pathname = usePathname();
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

  const isCameraActive = pathname === "/cards-partner-scan" && appState === "active";

  const handleScan = React.useCallback((result: BarcodeScanningResult) => {
    if (!isScanEnabled) {
      return;
    }

    setIsScanEnabled(false);
    setScannedValue(result.data);
  }, [isScanEnabled]);

  const handleRetry = React.useCallback(() => {
    setScannedValue(null);
    setIsScanEnabled(true);
  }, []);

  const handleRequestPermission = React.useCallback(async () => {
    const nextPermission = await CameraManager.requestCameraPermissionsAsync();
    setPermission(nextPermission);
  }, []);

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable style={styles.headerButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={20} color="#111827" />
            </Pressable>
            <Text style={styles.headerTitle}>Scan carte</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.pageTitle}>Scanner la carte</Text>
          <Text style={styles.pageSubtitle}>
            Cadrez le QR code ou la reference de votre carte Aether pour preparer sa liaison.
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
                  active={isCameraActive}
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  facing="back"
                  onBarcodeScanned={isScanEnabled && isCameraActive ? handleScan : undefined}
                  style={styles.camera}
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
                  Autorisez l'acces camera pour scanner une carte Aether.
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
                <Text style={styles.resultTitle}>Reference detectee</Text>
              </View>
              <Text style={styles.resultValue} numberOfLines={4}>
                {scannedValue}
              </Text>
              <View style={styles.resultActions}>
                <Pressable style={styles.secondaryButton} onPress={handleRetry}>
                  <Text style={styles.secondaryButtonText}>Scanner a nouveau</Text>
                </Pressable>
                <Pressable style={styles.primaryButton} onPress={() => router.back()}>
                  <Text style={styles.primaryButtonText}>Utiliser</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.helpCard}>
              <Text style={styles.helpTitle}>Format attendu</Text>
              <Text style={styles.helpText}>
                QR code Aether, reference partenaire ou identifiant de carte compatible.
              </Text>
            </View>
          )}
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
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 22,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
  },
  cameraFrame: {
    position: "relative",
    height: 420,
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
    width: 230,
    height: 144,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 24,
    backgroundColor: "transparent",
  },
  cameraFallback: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 44,
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
  resultActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  helpCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
  },
  helpTitle: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  helpText: {
    color: "#6B7280",
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
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 16,
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
