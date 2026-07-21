import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography, radii, shadows } from "../theme/tokens";
import { useApp } from "../store/AppContext";

export default function DashboardScreen() {
  const { streak, dailyQuote, points } = useApp();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GameQuittr</Text>

      <View style={[styles.card, shadows.card]}>
        <Text style={styles.cardTitle}>Current Streak</Text>
        <Text style={styles.streak}>
          {streak} day{streak === 1 ? "" : "s"}
        </Text>
      </View>

      <View style={[styles.card, shadows.card]}>
        <Text style={styles.cardTitle}>Daily Quote</Text>
        <Text style={styles.body}>“{dailyQuote}”</Text>
      </View>

      <View style={[styles.cardInline, shadows.card]}>
        <Text style={styles.cardTitle}>Points</Text>
        <Text style={styles.points}>{points}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  cardInline: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textDim,
  },
  streak: {
    ...typography.title,
    color: colors.success,
  },
  points: {
    ...typography.title,
    color: colors.primary,
  },
});
