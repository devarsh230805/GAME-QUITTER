import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export default function OnboardingIntro() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to GameQuittr</Text>
      <Text style={styles.body}>A faster, calmer path to healthier gaming habits. Start the short quiz to personalize your plan.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.lg },
  body: { ...typography.body, color: colors.textDim },
});
