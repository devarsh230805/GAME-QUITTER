import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function StyledButton({ 
  onPress, 
  title, 
  colors, 
  variant = 'primary',
  disabled = false,
  rectangular = false,
  style 
}) {
  const getColors = () => {
    if (disabled) return { bg: '#999999', text: '#CCCCCC' };
    
    switch (variant) {
      case 'primary':
        return { bg: colors.primary, text: colors.background };
      case 'secondary':
        return { bg: colors.secondary, text: colors.background };
      case 'danger':
        return { bg: colors.danger, text: '#FFFFFF' };
      default:
        return { bg: colors.primary, text: colors.background };
    }
  };

  const btnColors = getColors();

  return (
    <Pressable 
      onPress={disabled ? undefined : onPress} 
      style={({ pressed }) => [
        styles.button,
        rectangular && styles.rectangular,
        { backgroundColor: pressed ? colors.primaryDim : btnColors.bg },
        disabled && styles.disabled,
        style
      ]}
      disabled={disabled}
    >
      <Text style={[styles.text, { color: btnColors.text }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999, // Pill shape
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rectangular: {
    borderRadius: 12, // Rounded rectangle
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
  },
});
