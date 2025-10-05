// Design tokens for GameQuittr - Stickman UI (Black & White)
export const colors = {
  // Default theme colors - Black & White "Stickman UI"
  background: '#FFFFFF', // White background
  surface: '#FFFFFF', // White surface
  primary: '#111111', // Black buttons
  primaryDim: '#4B5563', // Dark gray for pressed states
  success: '#6EE7A0', // Keep success green
  warning: '#F2D36E', // Keep warning yellow
  danger: '#DC2626', // Red for danger
  text: '#111111', // Black text
  textDim: '#666666', // Gray text
  border: '#E5E7EB', // Light gray border
};

// Game mode theme colors (dark blue + warm orange)
export const gameModeColors = {
  background: '#0A1628', // Deep dark blue
  surface: '#1A2B42', // Darker blue surface
  primary: '#FF8C42', // Warm orange
  primaryDim: '#2D4A6B', // Muted blue
  success: '#6EE7A0', // Keep success green
  warning: '#FFB366', // Warmer orange for warnings
  danger: '#FF6B6B', // Softer red
  text: '#F0F4F8', // Light blue-white text
  textDim: '#94A3B8', // Muted blue-gray text
  border: '#334155', // Blue-gray border
};

// Function to get current theme colors
export const getThemeColors = (isGameMode = false) => {
  return isGameMode ? gameModeColors : colors;
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
  pill: 999,
};

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};
