import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../store/AppContext";
import { useAuth } from "../context/AuthContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import HeaderBar from "../components/HeaderBar";
import {
  getThemeColors,
  typography,
  spacing,
  radii,
  shadows,
} from "../theme/tokens";

export default function ProfileEditorScreen({ onClose }) {
  const {
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    dailyTargetHours,
    setDailyTargetHours,
    running,
    themeMode,
  } = useApp();
  const { updateProfile, user } = useAuth();

  const colors = getThemeColors(running, themeMode);
  const isGuest = !user || user.id === "guest-user";

  const [nameLocal, setNameLocal] = useState(profileName || "");
  const [emailLocal, setEmailLocal] = useState(profileEmail || "");
  const [targetHours, setTargetHours] = useState(dailyTargetHours || 0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Sync with context if it changes
  useEffect(() => {
    setNameLocal(profileName);
    setEmailLocal(profileEmail);
    setTargetHours(dailyTargetHours);
  }, [profileName, profileEmail, dailyTargetHours]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    // If Guest, update locally and return success
    if (isGuest) {
      setProfileName(nameLocal);
      setProfileEmail(emailLocal);
      setDailyTargetHours(targetHours);
      await updateProfile({
        display_name: nameLocal,
        email: emailLocal,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (onClose) setTimeout(onClose, 500);
      setLoading(false);
      return;
    }

    const { error: updateError } = await updateProfile({
      display_name: nameLocal,
      email: emailLocal,
      daily_target_hours: targetHours,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (onClose) setTimeout(onClose, 500); // Close after success if it's a modal
    }
    setLoading(false);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title="Edit Profile" />

      {onClose && (
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
            shadows.card,
          ]}
        >
          <Text style={[styles.label, { color: colors.textDim }]}>
            Display Name
          </Text>
          <TextInput
            value={nameLocal}
            onChangeText={setNameLocal}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Your name"
            placeholderTextColor={colors.textDim}
          />

          {!isGuest && (
            <>
              <Text
                style={[
                  styles.label,
                  { color: colors.textDim, marginTop: spacing.lg },
                ]}
              >
                Email Address
              </Text>
              <TextInput
                value={emailLocal}
                onChangeText={setEmailLocal}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="you@example.com"
                placeholderTextColor={colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </>
          )}

          <Text
            style={[
              styles.label,
              { color: colors.textDim, marginTop: spacing.xl },
            ]}
          >
            Daily Focus Target (Hours)
          </Text>
          <View style={styles.targetRow}>
            <Pressable
              style={[styles.targetBtn, { backgroundColor: colors.primary }]}
              onPress={() => setTargetHours(Math.max(0, targetHours - 0.5))}
            >
              <Text style={[styles.targetBtnText, { color: colors.surface }]}>
                -
              </Text>
            </Pressable>
            <Text style={[styles.targetValue, { color: colors.text }]}>
              {targetHours}h
            </Text>
            <Pressable
              style={[styles.targetBtn, { backgroundColor: colors.primary }]}
              onPress={() => setTargetHours(Math.min(12, targetHours + 0.5))}
            >
              <Text style={[styles.targetBtnText, { color: colors.surface }]}>
                +
              </Text>
            </Pressable>
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </Text>
          ) : null}
          {success ? (
            <Text style={[styles.successText, { color: colors.success }]}>
              Profile updated successfully!
            </Text>
          ) : null}

          <Pressable
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={[styles.saveButtonText, { color: colors.surface }]}>
                Save Changes
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 22 : 12,
    right: spacing.md,
    zIndex: 999,
    elevation: 10,
    padding: 10, // Increased touch area
  },
  card: {
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    ...typography.body,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.md,
  },
  targetBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  targetBtnText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  targetValue: {
    ...typography.subtitle,
    marginHorizontal: spacing.xl,
    minWidth: 60,
    textAlign: "center",
  },
  saveButton: {
    marginTop: spacing.xl,
    height: 56,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    ...typography.body,
    fontWeight: "700",
  },
  errorText: {
    ...typography.caption,
    textAlign: "center",
    marginTop: spacing.md,
  },
  successText: {
    ...typography.caption,
    textAlign: "center",
    marginTop: spacing.md,
    fontWeight: "600",
  },
});
