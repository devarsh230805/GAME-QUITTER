import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { colors, spacing, typography, radii } from "../theme/tokens";
import { useApp } from "../store/AppContext";

export default function ChallengesScreen() {
  const { challenges, toggleChallenge, points } = useApp();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Challenges</Text>
      <Text style={styles.points}>Points: {points}</Text>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: spacing.md }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggleChallenge(item.id)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
          >
            <View
              style={[styles.checkbox, item.completed && styles.checkboxOn]}
            >
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemMeta}>
                {item.completed ? "Completed" : `+${item.reward} pts`}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  points: { ...typography.subtitle, color: colors.primary },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginTop: spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: { color: "#001219", fontWeight: "800" },
  itemTitle: { ...typography.body, color: colors.text },
  itemMeta: { ...typography.caption, color: colors.textDim, marginTop: 2 },
});
