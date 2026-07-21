// Design tokens for GameQuittr - Stickman UI (Black & White)
export const colors = {
  // Minimalist Premium Light - Slate Black Accent
  background: "#F8FAFC", // Slate 50
  surface: "#FFFFFF",
  primary: "#0F172A", // Slate 900 (Black Accent)
  secondary: "#64748B", // Slate 500
  primaryDim: "#1E293B", // Slate 800
  secondaryDim: "#475569",
  success: "#10B981", // Emerald 500
  warning: "#F59E0B",
  danger: "#475569", // Slate 600 (Removes red from light mode)
  text: "#0F172A", // Slate 900
  textDim: "#475569", // Slate 600
  border: "#E2E8F0", // Slate 200
  accent: "#0F172A",
};

// Game mode theme colors (Light background & Orange/Yellow Accent)
export const gameModeColors = {
  background: "#F8FAFC", // Light background
  surface: "#FFFFFF", // White surface
  primary: "#FDA524", // Amber Orange (Primary Accent)
  secondary: "#64748B", // Slate 500
  primaryDim: "#D97706",
  secondaryDim: "#475569",
  success: "#10B981",
  warning: "#FDA524",
  danger: "#475569",
  text: "#0F172A", // Dark slate text
  textDim: "#475569", // Slate text dim
  border: "#E2E8F0", // Light border
  accent: "#FDA524",
};

// Minimalist Premium Dark - Deep Navy Slate
export const darkColors = {
  background: "#0B0F19", // Deep dark blue-black
  surface: "#1E293B", // Slate 800
  primary: "#F8FAFC", // Slate 50 (White Accent)
  secondary: "#94A3B8", // Slate 400
  primaryDim: "#E2E8F0", // Slate 200
  secondaryDim: "#64748B",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#94A3B8", // Neutral Slate 400 (Removes red from dark mode)
  text: "#F8FAFC", // Slate 50
  textDim: "#94A3B8", // Slate 400
  border: "#334155", // Slate 700
  accent: "#F8FAFC",
};

// Function to get current theme colors
export const getThemeColors = (isGameMode = false, themeMode = "light") => {
  if (isGameMode) return gameModeColors;
  return themeMode === "dark" ? darkColors : colors;
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 0.1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
};

export const shadows = {
  card: {},
  cyber: {},
};
