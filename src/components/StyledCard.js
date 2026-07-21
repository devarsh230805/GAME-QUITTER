import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { shadows } from "../theme/tokens";

export default function StyledCard({
  children,
  colors,
  variant = "default",
  style,
}) {
  const isGameMode = colors.background === "#040508";
  const isDark = colors.background === "#0B0F19";

  const gradientColors = isGameMode
    ? ["rgba(6, 10, 18, 0.96)", "rgba(15, 23, 42, 0.98)"]
    : isDark
      ? ["rgba(30, 41, 59, 0.95)", "rgba(15, 23, 42, 0.98)"]
      : ["#FFFFFF", "#F8FAFC"];

  const borderColor = isGameMode
    ? "#1E293B"
    : isDark
      ? "rgba(51, 65, 85, 0.45)"
      : "#E2E8F0";

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        { borderColor, borderWidth: 1 },
        isGameMode ? shadows.cyber : shadows.card,
        style,
      ]}
    >
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  content: {
    gap: 8,
  },
});
