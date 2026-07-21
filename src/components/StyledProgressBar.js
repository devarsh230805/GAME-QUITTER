import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function StyledProgressBar({
  progress = 0,
  colors,
  variant = "default",
  style,
}) {
  const isGameMode = variant === "game";
  const fillWidth = `${Math.min(100, Math.max(0, progress * 100))}%`;

  const getGradientColors = () => {
    const isDark = colors.background === "#0B0F19";
    if (isGameMode) return ["#FDA524", "#FDA524"]; // Matte Orange in Game Mode!
    if (isDark) return ["#E2E8F0", "#F8FAFC"]; // Silver/White progress bar in Dark Mode
    return ["#1E293B", "#0F172A"]; // Slate-Black progress bar in Light Mode
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isGameMode ? "#1E293B" : "#E2E8F0" },
        style,
      ]}
    >
      {progress > 0 && (
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: fillWidth }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 8,
  },
  fill: {
    height: "100%",
    borderRadius: 5,
  },
});
