import React from "react";
import { View, StyleSheet } from "react-native";
import { spacing, radii } from "../theme/tokens";

export default function OnboardingProgress({
  currentStep,
  totalSteps,
  colors,
}) {
  const progress = currentStep / totalSteps;
  const fillWidth = `${Math.min(100, Math.max(0, progress * 100))}%`;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: colors.border }]} />
      <View
        style={[
          styles.fill,
          { width: fillWidth, backgroundColor: colors.primary },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    width: "100%",
    position: "relative",
    marginVertical: spacing.md,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.full,
    opacity: 0.3,
  },
  fill: {
    height: "100%",
    borderRadius: radii.full,
  },
});
