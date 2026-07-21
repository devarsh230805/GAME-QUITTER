import { StyleSheet } from "react-native";
import { spacing, typography, radii } from "../theme/tokens";

export const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.xl,
    },
    spacer: { height: spacing.sm },
    heroContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    bottomContent: { marginTop: spacing.lg },
    hero: { width: "100%", height: 260, borderRadius: radii.lg },
    title: {
      ...typography.title,
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: "left",
    },
    body: {
      ...typography.body,
      color: colors.textDim,
      textAlign: "left",
      marginBottom: spacing.lg,
    },
    primary: {
      backgroundColor: colors.primary,
      borderRadius: radii.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      alignItems: "center",
      marginTop: spacing.md,
      alignSelf: "stretch",
    },
    primaryPressed: { backgroundColor: colors.primaryDim },
    primaryText: {
      ...typography.subtitle,
      color: colors.surface,
      fontWeight: "700",
    },
  });
