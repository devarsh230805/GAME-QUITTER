// Design tokens for GameQuittr - Stickman UI (Black & White)
export const colors = {
  // Default theme colors - Black & White "Stickman UI"
  background: '#FFFFFF', // White background
  surface: '#FFFFFF', // White surface
  primary: '#111111', // Black buttons
  secondary: '#4B5563', // Secondary action (gray) for default theme
  primaryDim: '#4B5563', // Dark gray for pressed states
  secondaryDim: '#374151', // Darker gray for pressed secondary
  success: '#6EE7A0', // Keep success green
  warning: '#F2D36E', // Keep warning yellow
  danger: '#DC2626', // Red for danger
  text: '#111111', // Black text
  textDim: '#666666', // Gray text
  border: '#E5E7EB', // Light gray border
};

// Game mode theme colors (Neon Cyberpunk)
export const gameModeColors = {
  background: '#0D0D0D', // Near-black background
  surface: '#0D0D0D', // Match background for seamless surfaces
  primary: '#00E5FF', // Neon cyan primary
  secondary: '#9C27B0', // Neon purple secondary
  primaryDim: '#00B2CC', // Dimmed cyan for pressed
  secondaryDim: '#6E1C7A', // Dimmed purple for pressed
  success: '#6EE7A0', // Keep success green
  warning: '#FF3B30', // Neon red for warnings/highlights
  danger: '#FF3B30', // Neon red for danger
  text: '#FFFFFF', // White primary text
  textDim: '#B0BEC5', // Cool grey secondary text
  border: '#1F2937', // Dark border that suits neon theme
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
