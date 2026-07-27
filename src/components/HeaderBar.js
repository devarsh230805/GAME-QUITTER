import React, { useMemo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../store/AppContext";
import { getThemeColors, typography, spacing } from "../theme/tokens";

export default function HeaderBar({ title }) {
  const { running, themeMode } = useApp();
  const colors = getThemeColors(running, themeMode);
  const styles = useMemo(
    () => createStyles(colors, running),
    [colors, running],
  );

  return (
    <LinearGradient
      colors={
        running
          ? ["rgba(99, 102, 241, 0.18)", "rgba(248, 250, 252, 0.04)"]
          : ["#FFFFFF", "#F8FAFC"]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.innerRow}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </LinearGradient>
  );
}

const createStyles = (colors, running) =>
  StyleSheet.create({
    container: {
      height: Platform.OS === "ios" ? 70 : 62,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    innerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: spacing.sm,
    },
    title: {
      ...typography.subtitle,
      color: colors.text,
      textAlign: "center",
    },
  });
