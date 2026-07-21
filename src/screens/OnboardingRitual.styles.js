import { StyleSheet } from "react-native";
import { spacing, typography, radii } from "../theme/tokens";

export const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.xl,
      justifyContent: "center",
    },
    title: {
      ...typography.title,
      color: colors.text,
      marginBottom: spacing.md,
      textAlign: "center",
    },
    body: {
      ...typography.body,
      color: colors.textDim,
      textAlign: "center",
      marginBottom: spacing.xl,
    },
    typeBox: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      alignSelf: "stretch",
      alignItems: "center",
    },
    typeBoxError: { borderColor: colors.danger },
    typeLine: { ...typography.body, fontWeight: "700", letterSpacing: 0.3 },
    matched: { color: colors.primary },
    remaining: { color: colors.textDim },
    hiddenInput: { position: "absolute", width: 1, height: 1, opacity: 0 },
    hint: {
      ...typography.caption,
      color: colors.danger,
      fontWeight: "700",
      marginTop: spacing.sm,
    },
    cta: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radii.md,
      alignItems: "center",
      marginTop: spacing.xl,
      alignSelf: "stretch",
    },
    ctaDisabled: { opacity: 0.5 },
    ctaText: { ...typography.label, color: colors.surface, fontWeight: "800" },
  });
