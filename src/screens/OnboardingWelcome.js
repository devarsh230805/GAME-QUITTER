import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { styles as staticStyles } from "./OnboardingWelcome.styles";
import { useApp } from "../store/AppContext";
import { getThemeColors, spacing, radii, typography } from "../theme/tokens";
import OnboardingProgress from "../components/OnboardingProgress";
import StyledButton from "../components/StyledButton";
import { Ionicons } from "@expo/vector-icons";

export default function OnboardingWelcome({ onNext }) {
  const { running, themeMode } = useApp();
  const colors = useMemo(
    () => getThemeColors(running, themeMode),
    [running, themeMode],
  );

  return (
    <View style={[staticStyles.container, { backgroundColor: "transparent" }]}>
      {/* App Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: spacing.xs,
        }}
      >
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
            style={{ color: colors.surface, fontSize: 10, fontWeight: "bold" }}
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

      {/* Progress Flow Bar */}
      <OnboardingProgress currentStep={1} totalSteps={7} colors={colors} />

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
          <Ionicons name="leaf" size={48} color={colors.primary} />
        </View>
        <Text
          style={{
            ...typography.subtitle,
            color: colors.text,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Live Consciously
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
          Reclaim your attention and invest it in real-world habits.
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
        <Text
          style={[
            staticStyles.title,
            { color: colors.text, textAlign: "center" },
          ]}
        >
          Life is waiting beyond the screen.
        </Text>

        <Text
          style={[
            staticStyles.body,
            {
              color: colors.textDim,
              marginTop: spacing.xs,
              textAlign: "center",
            },
          ]}
        >
          Simple commitment to help you live more, play less. Rediscover
          progress in the real world.
        </Text>

        <StyledButton
          title="Get Started"
          onPress={onNext}
          colors={colors}
          rectangular
          style={{ marginTop: spacing.xl, alignSelf: "stretch" }}
        />
      </View>
    </View>
  );
}
