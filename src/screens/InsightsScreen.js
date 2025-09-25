import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export default function InsightsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights & Analytics</Text>
      <Text style={styles.body}>Graphs coming soon: hours/day, streaks, month-over-month improvements.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.lg },
  body: { ...typography.body, color: colors.textDim },
});
