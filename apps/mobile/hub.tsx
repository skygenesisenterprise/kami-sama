import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import { simulatePaymentAuthorizationRequest } from "@/components/mobile/payment-authorization-listener";
import { useTabScrollToTop } from "@/components/mobile/tab-scroll-to-top";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

// TODO: Connect SGE API hub endpoint
// TODO: Connect Aether Identity services
// TODO: Connect financial privacy center
// TODO: Connect documents and statements
// TODO: Connect organization permissions
// TODO: Connect audit logs
// TODO: Connect support center
// TODO: Connect service status endpoint

const profile = {
  initials: "LD",
  name: "Liam Dispa",
};

const quickActions: { icon: IconName; label: string }[] = [
  { icon: "lock", label: "Confidentialité" },
  { icon: "description", label: "Documents" },
  { icon: "support-agent", label: "Support" },
  { icon: "settings", label: "Paramètres" },
];

const services: { icon: IconName; title: string; description: string; status: string; statusColor: string }[] = [
  { icon: "fingerprint", title: "Aether Identity", description: "Identité, MFA, Face ID et sessions.", status: "Active", statusColor: "#166534" },
  { icon: "book", title: "Aether Ledger", description: "Synchronisation, journal financier et statut.", status: "Operational", statusColor: "#166534" },
  { icon: "credit-card", title: "Aether Cards", description: "Cartes virtuelles, Apple Wallet et limites.", status: "Active", statusColor: "#166534" },
  { icon: "lock", title: "Aether Vaults", description: "Objectifs, coffres et budgets.", status: "Sandbox", statusColor: "#B45309" },
  { icon: "insights", title: "Aether Insights", description: "Analyse financière et recommandations.", status: "Planned", statusColor: "#6B7280" },
];

const privacyItems: { icon: IconName; title: string; description: string }[] = [
  { icon: "history", title: "Journal d'accès", description: "Consultez qui a accédé à vos données." },
  { icon: "file-download", title: "Exporter mes données", description: "Téléchargez vos transactions et informations." },
  { icon: "devices", title: "Applications connectées", description: "Gérez les services ayant accès à votre compte." },
  { icon: "gpp-good", title: "Consentements", description: "Contrôlez vos autorisations de partage." },
];

const hasOrganizationAccess = true;

const organizationItems: { icon: IconName; title: string; description: string }[] = [
  { icon: "business", title: "Sky Genesis Enterprise", description: "Organisation active" },
  { icon: "security", title: "Permissions financières", description: "Gérez les accès liés aux comptes." },
  { icon: "people", title: "Comptes collaborateurs", description: "Budgets, cartes et accès d'équipe." },
  { icon: "assignment", title: "Audit organisationnel", description: "Journal des actions sensibles." },
];

const tools: { icon: IconName; title: string }[] = [
  { icon: "calculate", title: "Simulateur de frais" },
  { icon: "speed", title: "Limites du compte" },
  { icon: "receipt-long", title: "Relevés bancaires" },
  { icon: "notifications", title: "Paramètres de notifications" },
  { icon: "security", title: "Sécurité des paiements" },
  { icon: "check-circle", title: "Statut des services" },
];

const systemStatus: { label: string; status: string; color: string }[] = [
  { label: "Aether Ledger", status: "Operational", color: "#1F8A4C" },
  { label: "SGE API", status: "Operational", color: "#1F8A4C" },
  { label: "Notifications", status: "Operational", color: "#1F8A4C" },
  { label: "Card Processor", status: "Sandbox", color: "#B45309" },
  { label: "Wero", status: "Planned", color: "#6B7280" },
];

export default function HubScreen() {
  const insets = usePhoneSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);

  useTabScrollToTop("hub", scrollRef);

  return (
    <ScreenTransition direction="up">
      <View style={styles.safeArea}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <HubHeader />
          <HubHero />
          <QuickActionsGrid />
          <PrototypePaymentSection />
          <ServicesSection />
          <PrivacySection />
          {hasOrganizationAccess && <OrganizationSection />}
          <ToolsSection />
          <SupportSection />
          <InfrastructureCard />
          <HubFooter />
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

function HubHeader() {
  return (
    <View style={styles.headerBlock}>
      <View style={styles.header}>
        <Pressable style={styles.avatarButton} onPress={() => router.push("/profile")}>
          <Text style={styles.avatarText}>{profile.initials}</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Hub</Text>
          <Text style={styles.headerSubtitle}>Centre de contrôle Aether Bank</Text>
        </View>
        <Pressable style={styles.headerIconButton} onPress={() => Alert.alert("Notifications", "Aucune notification pour le moment.")}>
          <MaterialIcons name="notifications" size={20} color="#111827" />
        </Pressable>
        <Pressable style={styles.headerIconButton} onPress={() => router.push("/profile-settings")}>
          <MaterialIcons name="settings" size={20} color="#111827" />
        </Pressable>
      </View>
    </View>
  );
}

function HubHero() {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroHeader}>
        <View style={styles.heroIconWrap}>
          <MaterialIcons name="hub" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.heroBadge}>
          <MaterialIcons name="verified" size={12} color="#166534" />
          <Text style={styles.heroBadgeText}>Souveraineté financière activée</Text>
        </View>
      </View>
      <Text style={styles.heroTitle}>Aether Bank Hub</Text>
      <Text style={styles.heroText}>Gérez vos services, votre confidentialité et vos accès financiers.</Text>
      <View style={styles.heroStatusRow}>
        <View style={styles.heroStatusItem}>
          <View style={[styles.heroStatusDot, { backgroundColor: "#1F8A4C" }]} />
          <Text style={styles.heroStatusLabel}>Aether Identity : Connected</Text>
        </View>
        <View style={styles.heroStatusItem}>
          <View style={[styles.heroStatusDot, { backgroundColor: "#1F8A4C" }]} />
          <Text style={styles.heroStatusLabel}>SGE API : Operational</Text>
        </View>
      </View>
    </View>
  );
}

function QuickActionsGrid() {
  return (
    <View style={styles.quickActionRow}>
      {quickActions.map((action) => (
        <Pressable key={action.label} style={styles.quickActionButton} onPress={() => Alert.alert(action.label, "Action simulée.")}>
          <View style={styles.quickActionIconWrap}>
            <MaterialIcons name={action.icon} size={20} color="#111827" />
          </View>
          <Text style={styles.quickActionLabel}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ServicesSection() {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Services Aether Bank</Text>
      <View style={styles.sectionDivider} />
      {services.map((service) => (
        <Pressable key={service.title} style={styles.serviceRow} onPress={() => Alert.alert(service.title, service.description)}>
          <View style={styles.serviceIcon}>
            <MaterialIcons name={service.icon} size={20} color="#111827" />
          </View>
          <View style={styles.serviceCopy}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
          </View>
          <View style={[styles.serviceBadge, { backgroundColor: service.status === "Sandbox" ? "#FEF3C7" : service.status === "Planned" ? "#F3F4F6" : "#DCFCE7" }]}>
            <Text style={[styles.serviceBadgeText, { color: service.statusColor }]}>{service.status}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function PrivacySection() {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Confidentialité financière</Text>
      <Text style={styles.sectionDescription}>
        Vie privée financière, souveraineté numérique et contrôle utilisateur.
      </Text>
      <View style={styles.sectionDivider} />
      {privacyItems.map((item) => (
        <Pressable key={item.title} style={styles.privacyRow} onPress={() => Alert.alert(item.title, item.description)}>
          <View style={styles.privacyIcon}>
            <MaterialIcons name={item.icon} size={20} color="#111827" />
          </View>
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>{item.title}</Text>
            <Text style={styles.privacyDescription}>{item.description}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
        </Pressable>
      ))}
    </View>
  );
}

function OrganizationSection() {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Organisation</Text>
      <View style={styles.sectionDivider} />
      {organizationItems.map((item) => (
        <Pressable key={item.title} style={styles.orgRow} onPress={() => Alert.alert(item.title, item.description)}>
          <View style={styles.orgIcon}>
            <MaterialIcons name={item.icon} size={20} color="#111827" />
          </View>
          <View style={styles.orgCopy}>
            <Text style={styles.orgTitle}>{item.title}</Text>
            <Text style={styles.orgDescription}>{item.description}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
        </Pressable>
      ))}
    </View>
  );
}

function PrototypePaymentSection() {
  return (
    <View style={styles.prototypeCard}>
      <View style={styles.prototypeHeader}>
        <View style={styles.prototypeIconWrap}>
          <MaterialIcons name="verified-user" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.prototypeBadge}>
          <Text style={styles.prototypeBadgeText}>Prototype</Text>
        </View>
      </View>
      <Text style={styles.prototypeTitle}>Verification de paiement mobile</Text>
      <Text style={styles.prototypeText}>
        Simule un parcours 3-D Secure / Identity Check avec redirection globale vers l'ecran d'autorisation.
      </Text>
      <Pressable
        accessibilityLabel="Simuler une verification de paiement"
        style={styles.prototypeButton}
        onPress={() => simulatePaymentAuthorizationRequest("auth_ovh_pending")}
      >
        <MaterialIcons name="play-arrow" size={18} color="#FFFFFF" />
        <Text style={styles.prototypeButtonText}>Simuler verification paiement</Text>
      </Pressable>
    </View>
  );
}

function ToolsSection() {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Outils</Text>
      <View style={styles.sectionDivider} />
      <View style={styles.toolsGrid}>
        {tools.map((tool) => (
          <Pressable key={tool.title} style={styles.toolItem} onPress={() => Alert.alert(tool.title, "Outil simulé.")}>
            <View style={styles.toolIcon}>
              <MaterialIcons name={tool.icon} size={18} color="#111827" />
            </View>
            <Text style={styles.toolLabel}>{tool.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SupportSection() {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Besoin d'aide ?</Text>
      <View style={styles.supportCard}>
        <View style={styles.supportIconWrap}>
          <MaterialIcons name="support-agent" size={28} color="#111827" />
        </View>
        <Text style={styles.supportTitle}>Support Aether Bank</Text>
        <Text style={styles.supportText}>
          Nous sommes là pour vous aider avec vos comptes, cartes et accès.
        </Text>
        <View style={styles.supportActions}>
          <Pressable style={styles.supportButton} onPress={() => Alert.alert("Centre d'aide", "Redirection vers le centre d'aide simulée.")}>
            <Text style={styles.supportButtonText}>Centre d'aide</Text>
          </Pressable>
          <Pressable style={styles.supportButtonSecondary} onPress={() => Alert.alert("Signaler un problème", "Formulaire de signalement simulé.")}>
            <Text style={styles.supportButtonSecondaryText}>Signaler un problème</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function InfrastructureCard() {
  return (
    <View style={styles.infrastructureCard}>
      <Text style={styles.infrastructureTitle}>Infrastructure</Text>
      {systemStatus.map((item) => (
        <View key={item.label} style={styles.infrastructureRow}>
          <Text style={styles.infrastructureLabel}>{item.label}</Text>
          <View style={styles.infrastructureStatus}>
            <View style={[styles.infrastructureDot, { backgroundColor: item.color }]} />
            <Text style={[styles.infrastructureStatusText, { color: item.color }]}>{item.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function HubFooter() {
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

  // Header
  headerBlock: {
    marginBottom: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 22,
    backgroundColor: "#111827",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: "#05070A",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 1,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },

  // Hero
  heroCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#111827",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#DCFCE7",
  },
  heroBadgeText: {
    color: "#166534",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  heroTitle: {
    color: "#05070A",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    marginBottom: 6,
  },
  heroText: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
    marginBottom: 16,
  },
  heroStatusRow: {
    gap: 8,
  },
  heroStatusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroStatusLabel: {
    color: "#374151",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },

  // Quick actions
  quickActionRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 18,
  },
  quickActionButton: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  quickActionLabel: {
    color: "#374151",
    textAlign: "center",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },

  // Prototype payment
  prototypeCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    backgroundColor: "#111827",
  },
  prototypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  prototypeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  prototypeBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  prototypeBadgeText: {
    color: "#E5E7EB",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  prototypeTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
    marginBottom: 6,
  },
  prototypeText: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  prototypeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#2563EB",
  },
  prototypeButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },

  // Sections
  sectionCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  sectionDescription: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },

  // Services
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  serviceIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  serviceCopy: {
    flex: 1,
  },
  serviceTitle: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  serviceDescription: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 1,
  },
  serviceBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  serviceBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },

  // Privacy
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  privacyIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  privacyCopy: {
    flex: 1,
  },
  privacyTitle: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  privacyDescription: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 1,
  },

  // Organization
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  orgIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  orgCopy: {
    flex: 1,
  },
  orgTitle: {
    color: "#05070A",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  orgDescription: {
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 1,
  },

  // Tools
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  toolItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 13,
    backgroundColor: "#F9FAFB",
  },
  toolIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  toolLabel: {
    color: "#05070A",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    flex: 1,
  },

  // Support
  supportCard: {
    alignItems: "center",
    paddingVertical: 12,
  },
  supportIconWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    marginBottom: 12,
  },
  supportTitle: {
    color: "#05070A",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    marginBottom: 6,
  },
  supportText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 18,
  },
  supportActions: {
    flexDirection: "row",
    gap: 10,
  },
  supportButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#111827",
  },
  supportButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  supportButtonSecondary: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  supportButtonSecondaryText: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },

  // Infrastructure
  infrastructureCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    backgroundColor: "#F9FAFB",
  },
  infrastructureTitle: {
    color: "#05070A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    marginBottom: 14,
  },
  infrastructureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  infrastructureLabel: {
    color: "#374151",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  infrastructureStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infrastructureDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  infrastructureStatusText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 8,
  },
  footerTitle: {
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  footerVersion: {
    color: "#D1D5DB",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 3,
  },
  footerMock: {
    color: "#E5E7EB",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginTop: 2,
  },
});
