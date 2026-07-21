import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, typography, radii } from "../theme/tokens";

const steps = [
  { key: "games", q: "Which games do you play most?" },
  { key: "hours", q: "Average hours/day of gaming?" },
  { key: "motive", q: "What motivates you to change?" },
  { key: "triggers", q: "What are your biggest triggers?" },
  { key: "peaks", q: "When are your peak gaming hours?" },
  { key: "severity", q: "How severe is the habit today (1-10)?" },
];

export default function OnboardingQuiz() {
  const [idx, setIdx] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding Quiz</Text>
      <Text style={styles.body}>{steps[idx].q}</Text>

      <Pressable
        style={styles.cta}
        onPress={() => setIdx((i) => (i + 1) % steps.length)}
      >
        <Text style={styles.ctaText}>
          {idx === steps.length - 1 ? "Finish" : "Next"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.lg },
  body: { ...typography.body, color: colors.textDim, marginBottom: spacing.xl },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
  },
  ctaText: { ...typography.subtitle, color: "#001219" },
});
