import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../store/AppContext";
import {
  getThemeColors,
  typography,
  spacing,
  radii,
  shadows,
} from "../theme/tokens";
import HeaderBar from "../components/HeaderBar";
import { Ionicons } from "@expo/vector-icons";
import ThemeShutter from "../components/ThemeShutter";

export default function SettingsScreen({ openEditor }) {
  const { user, profile, signOut } = useAuth();
  const { running, themeMode, setThemeMode, profileName, setFirstOpenDone } = useApp();
  const colors = getThemeColors(running, themeMode);

  const handleSignOut = async () => {
    try {
      setFirstOpenDone(false);
      await signOut();
    } catch (e) {
      console.error("[Settings] SignOut error:", e);
    }
  };

  const getDisplayName = () => {
    const isGuest = !user || user.id === "guest-user";
    if (isGuest) {
      return profileName || "Guest Explorer";
    }
    const rawName = profile?.display_name;
    const isEmail = rawName && rawName.includes("@");
    if (!rawName || isEmail) {
      const googleName = user?.user_metadata?.full_name || user?.user_metadata?.name;
      if (googleName) return googleName;
    }
    return rawName || "User";
  };

  const displayName = getDisplayName();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      <HeaderBar title="Settings" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
            shadows.card,
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.surface }]}>
                {getInitials(displayName)}
              </Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {displayName}
            </Text>
            {user?.email && user.email !== "guest@gamequitter.com" && (
              <Text style={[styles.profileEmail, { color: colors.textDim }]}>
                {user.email}
              </Text>
            )}
          </View>
          <Pressable
            style={[styles.editIconBtn, { backgroundColor: colors.background }]}
            onPress={openEditor}
          >
            <Ionicons name="pencil" size={18} color={colors.text} />
          </Pressable>
        </View>



        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textDim, marginTop: spacing.xl },
          ]}
        >
          Account
        </Text>
        <Pressable
          style={[
            styles.logoutButton,
            { backgroundColor: colors.surface, borderColor: colors.danger },
          ]}
          onPress={handleSignOut}
        >
          <Text style={[styles.logoutText, { color: colors.danger }]}>
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.subtitle,
    marginBottom: 4,
  },
  profileEmail: {
    ...typography.caption,
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  settingsGroup: {
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  settingLabel: {
    ...typography.body,
  },
  logoutButton: {
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    ...typography.body,
    fontWeight: "700",
  },
});
