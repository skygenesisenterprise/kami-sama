import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { defaultHomeWidgets, homeWidgetMetas, type HomeWidgetId } from "@/data/home-widgets";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

export default function WidgetCreateScreen() {
  const insets = usePhoneSafeAreaInsets();
  const params = useLocalSearchParams<{ activeWidgets?: string }>();
  const initialActiveWidgets = React.useMemo(() => {
    if (typeof params.activeWidgets === "string" && params.activeWidgets.length > 0) {
      return params.activeWidgets
        .split(",")
        .map((widgetId) => widgetId.trim())
        .filter((widgetId): widgetId is HomeWidgetId => defaultHomeWidgets.some((widget) => widget.id === widgetId));
    }

    return defaultHomeWidgets.filter((widget) => widget.enabled).map((widget) => widget.id);
  }, [params.activeWidgets]);
  const [activeWidgetIds, setActiveWidgetIds] = React.useState<HomeWidgetId[]>(initialActiveWidgets);

  const activeWidgets = React.useMemo(
    () => activeWidgetIds.map((widgetId) => homeWidgetMetas.find((widget) => widget.id === widgetId)).filter((widget) => widget !== undefined),
    [activeWidgetIds],
  );
  const availableWidgets = React.useMemo(
    () => homeWidgetMetas.filter((widget) => !activeWidgetIds.includes(widget.id)),
    [activeWidgetIds],
  );

  const handleSave = React.useCallback(() => {
    router.replace({
      pathname: "/home",
      params: {
        widgetOrder: activeWidgetIds.join(","),
        updatedAt: Date.now().toString(),
      },
    });
  }, [activeWidgetIds]);

  const handleAddWidget = React.useCallback((widgetId: HomeWidgetId) => {
    setActiveWidgetIds((currentWidgets) => (currentWidgets.includes(widgetId) ? currentWidgets : [...currentWidgets, widgetId]));
  }, []);

  const handleRemoveWidget = React.useCallback((widgetId: HomeWidgetId) => {
    setActiveWidgetIds((currentWidgets) => currentWidgets.filter((currentWidgetId) => currentWidgetId !== widgetId));
  }, []);

  const handleMoveWidget = React.useCallback((widgetId: HomeWidgetId, direction: "up" | "down") => {
    setActiveWidgetIds((currentWidgets) => {
      const currentIndex = currentWidgets.indexOf(widgetId);
      if (currentIndex === -1) {
        return currentWidgets;
      }

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= currentWidgets.length) {
        return currentWidgets;
      }

      const nextWidgets = [...currentWidgets];
      const [movedWidget] = nextWidgets.splice(currentIndex, 1);
      nextWidgets.splice(targetIndex, 0, movedWidget);
      return nextWidgets;
    });
  }, []);

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Pressable style={styles.closeButton} onPress={() => router.replace("/home")}>
              <MaterialIcons name="arrow-back" size={22} color="#111827" />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.headerEyebrow}>Personnalisation</Text>
              <Text style={styles.headerMeta}>{activeWidgetIds.length} widget{activeWidgetIds.length > 1 ? "s" : ""} actif{activeWidgetIds.length > 1 ? "s" : ""}</Text>
            </View>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </Pressable>
          </View>

          <Text style={styles.pageTitle}>Organiser les widgets</Text>
          <Text style={styles.pageDescription}>
            Le deplacement se fait ici. Choisissez l'ordre des sections et retirez celles que vous ne voulez pas sur l'accueil.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ordre actuel</Text>
            <View style={styles.card}>
              {activeWidgets.length > 0 ? (
                activeWidgets.map((widget, index) => (
                  <WidgetRow
                    key={widget.id}
                    title={widget.title}
                    description={widget.description}
                    icon={widget.icon}
                    isLast={index === activeWidgets.length - 1}
                    trailing={(
                      <View style={styles.rowActions}>
                        <Pressable style={styles.iconButton} onPress={() => handleMoveWidget(widget.id, "up")} disabled={index === 0}>
                          <MaterialIcons name="keyboard-arrow-up" size={18} color={index === 0 ? "#D1D5DB" : "#111827"} />
                        </Pressable>
                        <Pressable style={styles.iconButton} onPress={() => handleMoveWidget(widget.id, "down")} disabled={index === activeWidgets.length - 1}>
                          <MaterialIcons name="keyboard-arrow-down" size={18} color={index === activeWidgets.length - 1 ? "#D1D5DB" : "#111827"} />
                        </Pressable>
                        <Pressable style={styles.removeButton} onPress={() => handleRemoveWidget(widget.id)}>
                          <Text style={styles.removeButtonText}>Retirer</Text>
                        </Pressable>
                      </View>
                    )}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>Aucun widget actif. Ajoutez-en un ci-dessous.</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disponibles</Text>
            <View style={styles.card}>
              {availableWidgets.map((widget, index) => (
                <WidgetRow
                  key={widget.id}
                  title={widget.title}
                  description={widget.description}
                  icon={widget.icon}
                  isLast={index === availableWidgets.length - 1}
                  trailing={(
                    <Pressable style={styles.actionPill} onPress={() => handleAddWidget(widget.id)}>
                      <Text style={styles.actionPillText}>Ajouter</Text>
                    </Pressable>
                  )}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function WidgetRow({
  title,
  description,
  icon,
  isLast,
  trailing,
}: {
  title: string;
  description: string;
  icon: IconName;
  isLast: boolean;
  trailing: React.ReactNode;
}) {
  return (
    <View style={[styles.widgetRow, !isLast && styles.widgetRowSpacing]}>
      <View style={styles.widgetIcon}>
        <MaterialIcons name={icon} size={20} color="#111827" />
      </View>
      <View style={styles.widgetCopy}>
        <Text style={styles.widgetTitle}>{title}</Text>
        <Text style={styles.widgetDescription}>{description}</Text>
      </View>
      {trailing}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
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
  saveButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#111827",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "900",
  },
  headerEyebrow: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerMeta: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  pageTitle: {
    color: "#05070A",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 16,
  },
  pageDescription: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    marginTop: 12,
  },
  section: {
    marginTop: 26,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  widgetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  widgetRowSpacing: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  widgetIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  widgetCopy: {
    flex: 1,
    minWidth: 0,
  },
  widgetTitle: {
    color: "#05070A",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  widgetDescription: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  removeButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FEE2E2",
  },
  removeButtonText: {
    color: "#B91C1C",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "900",
  },
  actionPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#111827",
  },
  actionPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "900",
  },
});
