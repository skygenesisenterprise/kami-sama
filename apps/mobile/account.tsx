import * as React from "react";

import { StyleSheet, Text, View } from "react-native";

import {
  InfoCard,
  KeyValueRow,
  MobileScreen,
  SectionHeader,
  StatusBadge,
} from "@/components/mobile/developer-ui";
import { developerProfile } from "@/data/developer";
import { useTheme } from "@/hooks/use-theme";

export default function AccountScreen() {
  const theme = useTheme();

  return (
    <MobileScreen
      eyebrow="Account"
      title="Developer Profile"
      subtitle="Membership, verification, organization, settings, and support."
    >
      <InfoCard title={developerProfile.name} accent="#111827">
        <Text style={[styles.role, { color: theme.textSecondary }]}>{developerProfile.role}</Text>
        <KeyValueRow label="Current tier" value={developerProfile.tier} />
        <KeyValueRow label="Verification" value={developerProfile.verification} />
        <KeyValueRow label="Member since" value={developerProfile.memberSince} />
      </InfoCard>

      <SectionHeader title="Badges" />
      <View style={styles.badgeRow}>
        {developerProfile.badges.map((badge) => (
          <StatusBadge key={badge} label={badge} tone="green" />
        ))}
      </View>

      <InfoCard title="Organization" accent="#34A853">
        <KeyValueRow label="Name" value={developerProfile.organization} />
        <KeyValueRow label="Role" value="Admin" />
        <KeyValueRow label="Teams" value="Core, Review, Edge" />
      </InfoCard>

      <SectionHeader title="Settings" />
      <InfoCard title="Preferences" accent="#5E5CE6">
        <KeyValueRow label="Notifications" value="Platform and review alerts" />
        <KeyValueRow label="Security" value="Passkey required" />
      </InfoCard>

      <SectionHeader title="Support" />
      <InfoCard title="Developer Support" accent="#FF9500">
        <Text style={[styles.role, { color: theme.textSecondary }]}>
          Open documentation, contact review support, or schedule a program consultation.
        </Text>
      </InfoCard>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  role: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
