import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Canvas, RoundedRect, LinearGradient, vec, Shadow, Blur, Group } from '@shopify/react-native-skia';

export default function SkiaButton({ 
  onPress, 
  title, 
  colors, 
  variant = 'primary', // primary | secondary | danger
  disabled = false,
  style,
  width = 300,
  height = 48
}) {
  const getColors = () => {
    if (disabled) return { bg: '#999999', text: '#CCCCCC' };
    
    switch (variant) {
      case 'primary':
        return { bg: colors.primary, text: colors.background, glow: colors.primary };
      case 'secondary':
        return { bg: colors.secondary, text: colors.background, glow: colors.secondary };
      case 'danger':
        return { bg: colors.danger, text: '#FFFFFF', glow: colors.danger };
      default:
        return { bg: colors.primary, text: colors.background, glow: colors.primary };
    }
  };

  const btnColors = getColors();

  return (
    <Pressable 
      onPress={disabled ? undefined : onPress} 
      style={[{ width, height, justifyContent: 'center', alignItems: 'center' }, style]}
      disabled={disabled}
    >
      {({ pressed }) => (
        <>
          <Canvas style={{ position: 'absolute', width, height }} pointerEvents="none">
            {/* Glow effect */}
            <Group>
              <RoundedRect
                x={0}
                y={0}
                width={width}
                height={height}
                r={height / 2}
                color={btnColors.glow}
                opacity={pressed ? 0.4 : 0.3}
              />
              <Blur blur={20} />
            </Group>

            {/* Button background with gradient */}
            <RoundedRect
              x={2}
              y={2}
              width={width - 4}
              height={height - 4}
              r={(height - 4) / 2}
              opacity={pressed ? 0.8 : 1}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, height)}
                colors={[btnColors.bg, pressed ? colors.primaryDim : btnColors.bg]}
              />
              <Shadow dx={0} dy={pressed ? 1 : 2} blur={pressed ? 4 : 8} color="rgba(0,0,0,0.3)" />
            </RoundedRect>

            {/* Inner highlight */}
            <RoundedRect
              x={4}
              y={4}
              width={width - 8}
              height={2}
              r={height / 2}
              color="#FFFFFF"
              opacity={0.2}
            />
          </Canvas>
          
          <View style={styles.textContainer} pointerEvents="none">
            <Text style={[styles.text, { color: btnColors.text, opacity: pressed ? 0.8 : 1 }]}>
              {title}
            </Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
  },
});
