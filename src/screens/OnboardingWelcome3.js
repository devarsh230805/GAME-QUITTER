import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { createStyles } from "./OnboardingWelcome3.styles";
import { useApp } from "../store/AppContext";
import { getThemeColors, spacing, radii, typography } from "../theme/tokens";
import OnboardingProgress from "../components/OnboardingProgress";
import StyledButton from "../components/StyledButton";
import { Ionicons } from "@expo/vector-icons";

export default function OnboardingWelcome3({ onNext, onSkip, onBack }) {
  const { running, themeMode } = useApp();
  const colors = useMemo(
    () => getThemeColors(running, themeMode),
    [running, themeMode],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: spacing.xxl, backgroundColor: "transparent" },
      ]}
    >
      {/* Header with Back and Skip */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          height: 32,
          position: "relative",
          marginBottom: spacing.xs,
        }}
      >
        {!!onBack && (
          <Pressable
            onPress={onBack}
            style={{
              position: "absolute",
              left: 0,
              padding: 4,
              zIndex: 10,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 36 }}>
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

        {!!onSkip && (
          <Pressable
            onPress={onSkip}
            style={{
              position: "absolute",
              right: 0,
              padding: 4,
              zIndex: 10,
            }}
          >
            <Text style={{ ...typography.body, color: colors.textDim }}>
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      <OnboardingProgress currentStep={3} totalSteps={7} colors={colors} />

      {/* Hero Section - Abstract Premium Focus Illustration */}
      <View
        style={{
          flex: 1,
          marginTop: spacing.lg,
          borderRadius: radii.lg,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surface + "80",
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.xl,
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.primary + "15",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.lg,
          }}
        >
          <Ionicons name="trophy-outline" size={48} color={colors.primary} />
        </View>
        <Text
          style={{
            ...typography.subtitle,
            color: colors.text,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Real Achievements
        </Text>
        <Text
          style={{
            ...typography.caption,
            color: colors.textDim,
            textAlign: "center",
            marginTop: spacing.sm,
            paddingHorizontal: spacing.md,
            lineHeight: 18,
          }}
        >
          Exchange virtual achievements for real-world progress and growth.
        </Text>
      </View>

      {/* Content Section */}
      <View
        style={{
          marginTop: spacing.xl,
          marginBottom: spacing.xxl,
          alignItems: "center",
        }}
      >
        <Text style={[styles.title, { textAlign: "center" }]} numberOfLines={2}>
          Game over. Life on.
        </Text>
        <Text
          style={[styles.body, { textAlign: "center", marginTop: spacing.xs }]}
          numberOfLines={2}
        >
          Build new habits and rediscover life without addiction. It's time to
          play for real stakes.
        </Text>
        <StyledButton
          title="Next"
          onPress={onNext}
          colors={colors}
          rectangular
          style={{ marginTop: spacing.xl, alignSelf: "stretch" }}
        />
      </View>
    </View>
  );
}
