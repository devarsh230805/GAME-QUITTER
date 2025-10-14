import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function StyledProgressBar({ 
  progress = 0,
  colors, 
  variant = 'default',
  style
}) {
  const isGameMode = variant === 'game';
  const fillWidth = `${Math.min(100, Math.max(0, progress * 100))}%`;

  return (
    <View style={[
      styles.container,
      { backgroundColor: isGameMode ? colors.border : '#E5E7EB' },
      style
    ]}>
      <View style={[
        styles.fill,
        { 
          width: fillWidth,
          backgroundColor: colors.primary,
        }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});
