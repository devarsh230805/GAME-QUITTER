import { StyleSheet } from "react-native";
import { spacing, typography, radii, getThemeColors } from "../theme/tokens";

const colors = getThemeColors(false); // Light mode for onboarding

export const styles = StyleSheet.create({
  appIcon: {
    borderRadius: radii.sm,
    marginRight: spacing.sm,
    width: 24,
  },
  appName: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: "700",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  heroContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  hero: {
    width: "100%",
    height: 350,
    borderRadius: radii.lg,
  },
  bottomContent: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
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
    alignItems: "center",
    marginTop: spacing.md,
    alignSelf: "stretch",
  },
  primaryPressed: {
    backgroundColor: colors.primaryDim,
  },
  primaryText: {
    ...typography.subtitle,
    color: colors.surface,
    fontWeight: "700",
  },
  skipText: {
    ...typography.caption,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
