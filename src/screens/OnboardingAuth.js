import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../store/AppContext";
import { getThemeColors, typography, spacing, radii } from "../theme/tokens";
import OnboardingProgress from "../components/OnboardingProgress";
import StyledCard from "../components/StyledCard";
import StyledButton from "../components/StyledButton";
import { Ionicons } from "@expo/vector-icons";

export default function OnboardingAuth({ onDone, onBack }) {
  const { running, themeMode } = useApp();
  const colors = useMemo(
    () => getThemeColors(running, themeMode),
    [running, themeMode],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  const { user, signInWithGoogle, signInAsGuest } = useAuth();

  // Automatically advance when a session is detected
  useEffect(() => {
    if (user) {
      onDone?.();
    }
  }, [user, onDone]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      {/* App Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.xs,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {!!onBack && (
            <Pressable
              onPress={onBack}
              style={{ padding: 4, marginRight: spacing.sm }}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </Pressable>
          )}
          <View
            style={{
              backgroundColor: colors.primary,
              width: 28,
              height: 28,
              borderRadius: radii.sm,
              alignItems: "center",
              justifyContent: "center",
              marginRight: spacing.sm,
            }}
          >
            <Text
              style={{
                color: colors.surface,
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              GQ
            </Text>
          </View>
          <Text
            style={{
              ...typography.subtitle,
              color: colors.text,
              fontWeight: "700",
            }}
          >
            GameQuitter
          </Text>
        </View>
      </View>

      {/* Progress Flow Bar */}
      <OnboardingProgress currentStep={6} totalSteps={7} colors={colors} />

      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          opacity: fade,
          transform: [{ translateY: slide }],
        }}
      >
        <StyledCard colors={colors} style={styles.boxContainer}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.body}>Sign in to continue your journey</Text>

          <StyledButton
            title="Continue with Google"
            onPress={async () => {
              try {
                await signInWithGoogle();
              } catch (err) {
                console.error("Google sign-in error:", err.message);
              }
            }}
            colors={colors}
            rectangular
          />

          <StyledButton
            title="Continue as Guest"
            onPress={signInAsGuest}
            colors={colors}
            variant="secondary"
            rectangular
            style={{ marginTop: spacing.md }}
          />
        </StyledCard>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Your reflections are private and safe
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxl,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
      justifyContent: "center",
    },
    appIconContainer: {
      backgroundColor: colors.primary,
      width: 28,
      height: 28,
      borderRadius: radii.sm,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    appIconText: {
      color: colors.surface,
      fontSize: 10,
      fontWeight: "bold",
    },
    appName: {
      ...typography.subtitle,
      color: colors.text,
      fontWeight: "700",
    },
    boxContainer: {
      padding: spacing.xxl,
      borderRadius: 24,
      alignItems: "center",
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    body: {
      fontSize: 18,
      lineHeight: 26,
      color: colors.textDim,
      textAlign: "center",
      marginBottom: 40,
    },
    primary: {
      borderRadius: radii.lg,
      paddingVertical: spacing.lg,
      alignItems: "center",
      alignSelf: "stretch",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryText: {
      ...typography.subtitle,
      color: colors.surface,
      fontWeight: "800",
    },
    footerNote: {
      marginTop: spacing.xxl,
      alignItems: "center",
    },
    footerNoteText: {
      ...typography.caption,
      color: colors.textDim,
      fontSize: 16,
      opacity: 0.8,
    },
  });
