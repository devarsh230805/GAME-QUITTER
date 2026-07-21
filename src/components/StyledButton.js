import React from "react";
import { Pressable, Text, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function StyledButton({
  onPress,
  title,
  colors,
  variant = "primary",
  disabled = false,
  rectangular = false,
  style,
}) {
  const getGradientColors = () => {
    if (disabled) return ["#94A3B8", "#64748B"]; // Greyed out

    const isGameMode = colors.background === "#040508";
    const isDark = colors.background === "#0B0F19";

    switch (variant) {
      case "primary":
        if (isGameMode) return ["#FDA524", "#FDA524"]; // Matt Orange in Game Mode!
        if (isDark) return ["#FFFFFF", "#E2E8F0"]; // White/Silver button in Dark Mode
        return ["#1E293B", "#0F172A"]; // Slate-Black button in Light Mode
      case "secondary":
        if (isGameMode) return ["#27272A", "#18181B"]; // Matte Zinc Grey in Game Mode
        if (isDark) return ["#334155", "#1E293B"]; // Slate
        return ["#E2E8F0", "#CBD5E1"]; // Light Grey
      case "danger":
        if (isDark) return ["#334155", "#1E293B"]; // Slate grey in Dark Mode
        return ["#64748B", "#475569"]; // Slate Gray in Light Mode (No Red!)
      default:
        return ["#1E293B", "#0F172A"];
    }
  };

  const getTextColor = () => {
    if (disabled) return "#E2E8F0";
    const isGameMode = colors.background === "#040508";
    const isDark = colors.background === "#0B0F19";

    if (variant === "primary") {
      if (isGameMode) return "#FFFFFF"; // White text on Red
      if (isDark) return "#0B0F19"; // Dark text on White button
      return "#FFFFFF"; // White text on Black button
    }
    if (variant === "secondary") {
      if (isGameMode) return "#040508"; // Dark text on cyan secondary
      if (isDark) return "#FFFFFF";
      return "#0F172A";
    }
    return "#FFFFFF"; // Danger, etc.
  };

  const gradientColors = getGradientColors();
  const textColor = getTextColor();

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.pressable,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={
            pressed ? gradientColors.map((c) => c + "CC") : gradientColors
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            rectangular ? styles.rectangular : styles.pill,
          ]}
        >
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    ...Platform.select({
      web: { cursor: "pointer" },
      default: {},
    }),
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    borderRadius: 999,
  },
  rectangular: {
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
