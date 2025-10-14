import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function StyledCard({ children, colors, variant = 'default', style }) {
  const isGameMode = colors.background === '#FF9100';

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.surface,
        borderColor: isGameMode ? colors.border : '#E5E7EB',
        borderWidth: isGameMode ? 1 : 1,
        shadowColor: isGameMode ? colors.border : '#000',
        shadowOpacity: isGameMode ? 0.3 : 0,
        shadowRadius: isGameMode ? 8 : 0,
        elevation: isGameMode ? 4 : 0,
      },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
});
