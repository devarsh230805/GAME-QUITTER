import { StyleSheet } from "react-native";
import { spacing, typography, radii } from "../theme/tokens";

export const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.xl,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },
    navTxt: { ...typography.body, color: colors.text },
    progressWrap: {
      flex: 1,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: radii.sm,
      marginHorizontal: spacing.md,
      overflow: "hidden",
    },
    progressBar: { height: 6, backgroundColor: colors.primary },
    lang: { ...typography.caption, color: colors.textDim },
    qTitle: {
      ...typography.label,
      color: colors.textDim,
      marginBottom: spacing.xs,
    },
    prompt: {
      ...typography.title,
      color: colors.text,
      marginBottom: spacing.lg,
      textAlign: "left",
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      borderRadius: radii.lg,
      marginBottom: spacing.md,
      elevation: 1,
    },
    optionPressed: { backgroundColor: colors.border },
    badge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeTxt: { ...typography.body, color: colors.text },
    optionTxt: { ...typography.body, color: colors.text },
    skipArea: { alignItems: "center", marginTop: spacing.lg },
    skipTxt: { ...typography.body, color: colors.textDim },
  });
